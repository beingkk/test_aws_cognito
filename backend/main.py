if __name__ == "__main__":
    import uvicorn
    from dotenv import load_dotenv

    load_dotenv()
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
