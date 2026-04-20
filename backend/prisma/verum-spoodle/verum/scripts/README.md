# Scripts

Utility scripts for Verum development and maintenance.

## Available Scripts

### `init_db.py`
Initialize the database and create all tables.

```bash
python scripts/init_db.py
```

### `collect_articles.py`
Collect veterinary articles from PubMed Central (to be implemented).

```bash
python scripts/collect_articles.py
```

### Future Scripts

- `generate_embeddings.py` - Generate embeddings for articles
- `upload_to_pinecone.py` - Upload articles to Pinecone vector database
- `test_rag.py` - Test RAG pipeline with sample queries
