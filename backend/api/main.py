import os
import sys
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import io

# Add the parent directory to sys.path to import existing logic
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from input.image_to_df import image_to_json
from categorizer.categorizer import categorizer
from categorizer.categorize_transaction import categorize_transaction
from categorizer.data_combiner import combine
from analysis.expense_analyzer import top_expenses_by_category, bottom_expenses_by_category, investment_analysis
from analysis.expense_summarizer import summarize_expenses
from analysis.chatbot import get_chat_response

app = FastAPI(title="Expense Tracker API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    transaction_id: Optional[str] = "0"
    description: str
    amount_spent: float
    date: str
    category: Optional[str] = None
    transaction_type: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    context: Optional[str] = ""

class AnalysisRequest(BaseModel):
    transactions: List[dict]

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    
    if file.content_type == "text/csv":
        try:
            df = pd.read_csv(io.BytesIO(content))
            if df.empty:
                raise HTTPException(status_code=400, detail="CSV is empty")
            
            # Reusing logic from app.py to normalize columns
            if 'description' not in df.columns:
                text_cols = [c for c in df.columns if df[c].dtype == 'object']
                if text_cols:
                    df = df.rename(columns={text_cols[0]: 'description'})
            
            if 'amount' in df.columns:
                df = df.rename(columns={'amount': 'amount_spent'})
            elif 'amount_spent' not in df.columns:
                num_cols = [c for c in df.columns if df[c].dtype in ['float64', 'int64']]
                if num_cols:
                    df = df.rename(columns={num_cols[0]: 'amount_spent'})
            
            # Ensure required columns exist
            if 'description' not in df.columns or 'amount_spent' not in df.columns:
                raise HTTPException(status_code=400, detail="Required columns (description, amount) not found")

            # Add default date if missing
            if 'date' not in df.columns:
                df['date'] = pd.Timestamp.now().strftime('%Y-%m-%d')

            return df.to_dict(orient="records")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"CSV processing error: {str(e)}")

    elif file.content_type in ["image/jpeg", "image/png"]:
        try:
            class MockFile:
                def getvalue(self): return content
                @property
                def type(self): return file.content_type
            
            extracted_data = image_to_json(MockFile())
            return extracted_data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use CSV or Image.")

@app.post("/categorize")
async def categorize_data(transactions: List[dict]):
    try:
        df = pd.DataFrame(transactions)
        if 'description' not in df.columns:
            return {"error": "Missing description field"}
        
        # Reuse existing categorizer logic
        cat_result = categorizer(df)
        cat_df = categorize_transaction(cat_result)
        combined_df = combine(df, cat_df)
        
        return combined_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import matplotlib.pyplot as plt
import base64

def get_base64_plot(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return f"data:image/png;base64,{img_str}"

@app.post("/analyze")
async def analyze_data(transactions: List[dict]):
    try:
        df = pd.DataFrame(transactions)
        if df.empty:
            return {"income": 0, "investment": 0, "savings": 0, "top_expenses": [], "bottom_expenses": [], "charts": {}}

        income = df[df['transaction_type'] == 'income']['amount_spent'].sum()
        investment, savings = investment_analysis(df)
        top_exp = top_expenses_by_category(df).to_dict()
        bottom_exp = bottom_expenses_by_category(df).to_dict()

        # Generate Charts
        charts = {}
        
        # 1. Income vs Expenses
        fig1, ax1 = plt.subplots(figsize=(6, 4))
        inc_val = income
        exp_val = df[df['transaction_type'] == 'expense']['amount_spent'].sum()
        ax1.bar(['Income', 'Expenses'], [inc_val, exp_val], color=['#10B981', '#EF4444'])
        ax1.set_title('Income vs Expenses')
        charts['income_vs_expenses'] = get_base64_plot(fig1)

        # 2. Expenses by Category
        expenses_df = df[df['transaction_type'] == 'expense']
        if not expenses_df.empty:
            fig2, ax2 = plt.subplots(figsize=(8, 4))
            cat_exp = expenses_df.groupby('category')['amount_spent'].sum().sort_values(ascending=False)
            cat_exp.plot(kind='bar', color='#3B82F6', ax=ax2)
            ax2.set_title('Expenses by Category')
            plt.xticks(rotation=45)
            charts['expenses_by_category'] = get_base64_plot(fig2)

        return {
            "income": float(income),
            "investment": float(investment),
            "savings": float(savings),
            "top_expenses": top_exp,
            "bottom_expenses": bottom_exp,
            "charts": charts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summary")
async def get_summary(data: dict):
    # Expects top_expenses, bottom_expenses, income, investment, savings
    try:
        # Convert dicts back to Series for summarize_expenses
        top_exp = pd.Series(data.get("top_expenses", {}))
        bottom_exp = pd.Series(data.get("bottom_expenses", {}))
        
        summary = summarize_expenses(
            top_exp, 
            bottom_exp, 
            data.get("income", 0), 
            data.get("investment", 0), 
            data.get("savings", 0)
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = get_chat_response(request.message, request.history, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
