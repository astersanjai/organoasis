# OraganOasis

This is the OraganOasis Django project (organ donation dashboard).

Quick start (Windows PowerShell):

```powershell
cd E:\Organoasis\OraganOasis
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Notes:
- The project uses Django 4.2 (see `requirements.txt`).
- `db.sqlite3` is included in the repository; remove it before publishing if you don't want the DB committed.
- Add any additional dependencies to `requirements.txt` and run `pip install -r requirements.txt` before pushing.
