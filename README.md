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
  </p>
</div>

<hr />

## 📖 Sobre el Proyecto

**Fashion't Park** es una plataforma de comercio electrónico completa y moderna. El objetivo del proyecto fue construir una arquitectura **Full Stack** robusta, escalable y segura desde cero, simulando un entorno de producción real.

La tienda permite a los usuarios navegar por categorías jerárquicas, buscar productos, gestionar un carrito de compras persistente y administrar sus perfiles. Incluye un **Panel de Administración** completo para la gestión de inventario, usuarios y auditoría.

### ✨ Características Principales

* **🛍️ Tienda Pública:**
    * Búsqueda inteligente y filtros por categorías (Mega Menu).
    * Carrito de compras sincronizado (Local + Base de Datos).
    * Diseño responsivo y animaciones fluidas.
* **🛡️ Panel de Administración:**
    * **Dashboard:** Métricas y gráficos de ventas/inventario (Recharts).
    * **Gestión de Roles:** Sistema RBAC (Admin, Manager, User).
    * **Auditoría:** Registro de logs de actividad (quién creó/editó/eliminó qué).
    * **CRUD Completo:** Productos y Usuarios.
* **🔐 Seguridad:**
    * Autenticación JWT con Cookies `HttpOnly`.
    * Validación de datos con Zod.
    * Protección CORS y Middleware de seguridad.

---

## 🛠️ Tech Stack

Esta aplicación utiliza una arquitectura monolítica modularizada en contenedores Docker.

| Área | Tecnologías |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React, Tailwind CSS, Zustand, Lucide React. |
| **Backend** | Node.js, Express, TypeScript, PostgreSQL (pg). |
| **DevOps** | Docker, Docker Compose, AWS ECR (Registry), AWS App Runner. |
| **Infraestructura** | AWS RDS (Base de datos), AWS Route 53 (DNS), CloudFront (CDN). |

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
* Docker & Docker Compose
* PostgreSQL (Local o en Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Envigite/Ecommerce-minecraft.git
cd Ecommerce-minecraft
