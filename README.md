<div align="center">
  <br />
  <a href="https://www.fashiontpark.store" target="_blank">
    <h1 style="font-size: 3rem; font-weight: bold;">Fashion't Park 🧊</h1>
  </a>
  
  <p>
    <strong>Un E-commerce Full Stack inspirado en el universo de Minecraft.</strong>
  </p>

  <p>
    <a href="https://www.fashiontpark.store"><strong>🔗 Ver Demo en Vivo</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" />
    <img src="https://img.shields.io/badge/AWS-Deployed-FF9900?style=for-the-badge&logo=amazon-aws" />
    <img src="https://img.shields.io/badge/Jest-Tested-C21325?style=for-the-badge&logo=jest" />
    <img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions" />
  </p>
</div>

<hr />

## 📖 Sobre el Proyecto

**Fashion't Park** es una plataforma de comercio electrónico completa y moderna. El objetivo del proyecto fue construir una arquitectura **Full Stack** robusta, escalable y segura, simulando un entorno de producción real

La tienda no solo permite comprar, sino que implementa un flujo de checkout real con pasarela de pagos, gestión de stock en tiempo real, facturación y seguimiento de envíos. Además, cuenta con un pipeline de **CI/CD** que asegura que solo el código testeado llegue a producción.

---

## ✨ Características Principales

### 🛒 Experiencia de Compra y Checkout
* **Pasarela de Pagos:** Integración completa con **Mercado Pago** (Sandbox).
* **Gestión de Carrito:** Persistencia híbrida (Local Storage para invitados + Base de Datos sincronizada al iniciar sesión).
* **Direcciones y Envíos:** CRUD de direcciones de usuario y cálculo de costos de envío.
* **Procesamiento de Órdenes:** * Actualización automática de stock tras el pago exitoso.
    * Generación de historial de órdenes para el usuario.
    * Validación de tarjetas (simulación segura guardando solo `last4`).

### 🛡️ Panel de Administración (Backoffice)
* **Dashboard Analítico:** Métricas visuales de ventas e inventario.
* **Gestión de Roles (RBAC):** Permisos diferenciados para Admin, Manager y User.
* **Auditoría Avanzada:** Sistema de logs inmutables que registra *quién* modificó *qué* (ej: cambio de precio, eliminación de producto).
* **Atención al Cliente:** Visualización y respuesta de tickets de contacto.

### 📧 Comunicación y Soporte
* **Email Service:** Integración con **Resend** para correos transaccionales.
* **Auto-Reply:** Respuestas automáticas al recibir formularios de contacto.
* **Notificaciones:** Confirmaciones de estado de mensajes.

### 🔐 Seguridad y Calidad
* **Autenticación Robusta:** JWT en Cookies `HttpOnly`, Hash con Bcrypt y OAuth (Google).
* **Protección de Datos:** Validación estricta con **Zod** en Backend y Frontend.
* **Unit Testing:** Cobertura de tests unitarios en controladores, middlewares y lógica de negocio crítica.

---

## ⚙️ DevOps & CI/CD Pipeline

Este proyecto implementa un flujo de **Integración y Despliegue Continuo** automatizado para asegurar la estabilidad del código.

1.  **Push/PR:** El código se sube a GitHub.
2.  **GitHub Actions:** Se activa automáticamente el workflow de CI.
    * Instalación de dependencias y Build.
    * **Ejecución de Tests (Jest):** Se corren tests unitarios (Auth, Payments, Orders, Products, etc.).
3.  **Validación:** Si algún test falla, el Merge se bloquea.
4.  **Deploy Hook:** Solo si los tests pasan (Green Check ✅), GitHub notifica a **Render**.
5.  **Producción:** Render despliega la nueva versión automáticamente.

---

## 🛠️ Tech Stack

| Área | Tecnologías |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React, Tailwind CSS, Zustand, Lucide React, Recharts. |
| **Backend** | Node.js, Express, TypeScript, PostgreSQL (pg). |
| **Integraciones** | **Mercado Pago API**, **Resend (Emails)**, Google OAuth. |
| **Testing** | **Jest**, Supertest. |
| **DevOps** | Docker, **GitHub Actions (CI)**, Render (CD + Hosting). |
| **Seguridad** | Zod (Validaciones), JWT, Bcrypt. |

---

## 📸 Capturas de Pantalla

| Home Page | Panel de Administración |
| :---: | :---: |
<img src="https://i.gyazo.com/554267c8a8c3791c837de5d2ccf8b482.jpg" alt="Home" width="100%" /> | <img src="https://i.gyazo.com/2c9265a3ef8015ac81fc6fed59a85aa8.png" alt="Dashboard" width="100%" /> |
| **Carrito de Compras** | **Gestión de Productos** |
| *Agrega imagen del carrito* | *Agrega imagen del CRUD* |

---

## 🚀 Instalación y Ejecución Local

Sigue estos pasos para correr el proyecto en tu máquina.

### Prerrequisitos

* Node.js v20+
* PostgreSQL (Local o en Docker)
Variables de entorno para Mercado Pago y Resend.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Envigite/Ecommerce-minecraft.git
cd Ecommerce-minecraft
```

### 2. Tests
```bash
cd backend
npm test
```
