# The Party App

## VM Database Connection

Connect to the PostgreSQL database on the VM via SSH tunnel:

```bash
ssh -i ~/.ssh/id_ed25519 -L 4001:localhost:5432 andrei4_stanciu@34.132.160.228
```

Then connect with DBeaver or any PostgreSQL client:
- **Host:** `localhost`
- **Port:** `4001`
- **Database:** `mydatabase`
- **Username:** `user`
- **Password:** `password`
- **JDBC URL:** `jdbc:postgresql://localhost:4001/mydatabase`
