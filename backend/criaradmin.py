from database import SessionLocal
from models import Admin
from auth import gerar_hash_senha

db = SessionLocal()
admin = Admin(username="admin", senha_hash=gerar_hash_senha("123456"))
db.add(admin)
db.commit()
db.close()
print("Admin criado!")