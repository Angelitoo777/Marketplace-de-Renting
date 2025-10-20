# 🏠 BoneRent — Backend Marketplace de Rentas

**BoneRent** es un **backend modular y escalable** para un marketplace de alquiler de productos.  
Incluye autenticación, gestión de usuarios y productos, pagos con Stripe, mensajería asíncrona con RabbitMQ, almacenamiento en Redis y notificaciones automáticas por correo.

---

## 🧩 Arquitectura del Proyecto

```bash
📦 src/
├── controllers/        # Lógica de negocio
├── services/           # Servicios (RabbitMQ, Stripe, Cron, Email)
├── models/             # Modelos Sequelize
├── routes/             # Endpoints API
├── databases/          # Configuración MySQL y Redis
├── middlewares/        # Validaciones, autenticación, etc.
├── views/              # Plantillas EJS (testing, visualización)
└── app.js              # Punto de entrada principal
```

---

## ⚙️ Tecnologías Principales

| Tipo | Tecnología |
|------|-------------|
| **Servidor** | Node.js + Express |
| **ORM** | Sequelize (MySQL) |
| **Mensajería** | RabbitMQ |
| **Cache** | Redis |
| **Pagos** | Stripe Payment Intents |
| **Emails** | Nodemailer + Templates HTML |
| **Tareas Programadas** | Node-Cron |
| **Documentación API** | Swagger Autogen |
| **Autenticación** | JWT + Cookies HTTPOnly |

---

## 🚀 Características Principales

### 🧑‍💼 Autenticación
- Registro y login de usuarios con validaciones.
- Roles: arrendador (quien ofrece productos) y arrendatario (quien renta).
- Tokens seguros con expiración.

### 📦 Productos
- CRUD completo de productos.
- Campo `available` sincronizado con el estado de las rentas.

### 💳 Rentas
- Creación de rentas con validaciones de fechas y solapamiento.
- Cálculo automático de precio total (`pricePerDay * días`).
- Estado inicial “Pending”.
- Cambio de estado automático según:
  - Pago confirmado.
  - Inicio y fin del período (con **cron job**).
  - Expiración sin pago.

### 🧾 Pagos (Stripe)
- Integración con **Stripe Payment Intents**.
- Metadata asociada al `rental_id`, `product_id` y `renter_id`.
- Actualización automática de `payment_status` (`pending`, `paid`, `failed`, `refunded`).

### 📨 RabbitMQ (Event Driven)
- Publicación de eventos:
  - `rental_paid`
  - `rental_failed`
  - `rental_started`
  - `rental_ended`
  - `rental_canceled_auto`
- Consumidores separados para:
  - Actualizar estados de renta.
  - Enviar correos automáticos.

### 💌 Correos automáticos
- Envío de emails transaccionales (HTML templates).
- Ejemplos:
  - Confirmación de pago.
  - Inicio de renta.
  - Fin de renta.
  - Cancelación automática.

### ⏰ Cron Jobs
- Corre cada minuto para:
  - Marcar rentas iniciadas (`startDate = hoy`).
  - Finalizar rentas vencidas (`endDate < hoy`).
  - Cancelar rentas no pagadas.

### 🧠 Caching
- Invalidation selectiva de caché Redis al crear o actualizar rentas/productos.

### 📘 Documentación
- Swagger UI disponible en `/api-docs`.
- Autogenerado desde las rutas con `swagger-autogen`.

---

## 🧠 Flujo General del Sistema

```mermaid
graph TD
A[Usuario crea renta] --> B[Stripe genera PaymentIntent]
B --> C{Pago exitoso?}
C -->|Sí| D[Evento rental_paid → RabbitMQ]
C -->|No| E[Evento rental_failed → RabbitMQ]
D --> F[Consumer actualiza renta a "en curso"]
E --> G[Consumer marca renta "cancelada"]
F --> H[CronJob monitorea fechas]
H --> I[Evento rental_ended]
I --> J[Email de finalización]
```

---

## 🧰 Instalación y Configuración

```bash
# 1️⃣ Clona el repositorio
git clone https://github.com/Angelitoo777/bonerent-backend.git
cd bonerent-backend

# 2️⃣ Instala dependencias
npm install

# 3️⃣ Configura variables de entorno
cp .env.example .env

# 4️⃣ Levanta servicios externos (MySQL, Redis, RabbitMQ)
docker-compose up -d // en proceso

# 5️⃣ Inicia el servidor
npm run dev
```

### 🧾 Variables de entorno requeridas

```env
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLIC_KEY=
RABBITMQ_URL=
EMAIL_USER=
EMAIL_PASS=
```

---

## 🧪 Endpoints principales

| Método | Endpoint | Descripción |
|--------|-----------|--------------|
| `POST` | `/auth/register` | Registro de usuario |
| `POST` | `/auth/login` | Inicio de sesión |
| `GET` | `/api/products` | Listar productos |
| `POST` | `/api/rentals` | Crear una nueva renta |
| `GET` | `/api/rentals/my` | Ver rentas del usuario actual |
| `POST` | `/api/stripe/payment-intent` | Crear PaymentIntent |
| `GET` | `/api-docs` | Documentación Swagger |

---

## 🧩 Ejemplo de Flujo

1. Usuario inicia sesión.  
2. Crea una renta (`POST /api/rentals`).  
3. El backend genera un **PaymentIntent de Stripe**.  
4. Al confirmar el pago:
   - Se publica un evento `rental_paid`.  
   - RabbitMQ activa el **consumer** que actualiza el estado.  
   - Se envía un **email de confirmación**.  
5. El **cron job** detecta el inicio y fin de la renta.  
6. Se liberan los productos automáticamente al finalizar.

---

## 👨‍💻 Autor

**Desarrollador:** Angel Oropeza  
**Rol:** Backend Developer  
**Stack:** Node.js, Express, Sequelize, Stripe, RabbitMQ, Redis  
**Proyecto:** BoneRent — Marketplace de Alquiler Inteligente 🧠  