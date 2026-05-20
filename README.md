# Euronutra - Gestión de Stock Web 🚀

Este proyecto es una herramienta web diseñada para facilitar la gestión de inventario y el control de stock de productos mediante el uso de la cámara del dispositivo para escanear códigos de barras.

## ✨ Características

- **🔐 Autenticación Segura:** Sistema de login con cifrado de contraseñas mediante `bcryptjs`.
- **📸 Escaneo en Tiempo Real:** Integración con la librería `html5-qrcode` para detectar IDs de productos directamente desde la cámara (móvil o escritorio).
- **🔄 Actualización Dinámica:** Al detectar un código, el sistema actualiza automáticamente el stock en la base de datos MySQL mediante una API interna.
- **📊 Panel de Historial:** Vista detallada de todos los artículos registrados, permitiendo la visualización del stock actual y ajustes manuales.
- **📱 Diseño Responsive:** Interfaz moderna y adaptable construida con **Bootstrap 5**.

## 🛠️ Tecnologías utilizadas

*   **Backend:** Node.js & Express
*   **Base de Datos:** MySQL
*   **Frontend:** EJS (Motores de plantilla), Bootstrap 5
*   **Lector de Barras:** HTML5-QRCode
*   **Seguridad:** bcryptjs

## 📋 Requisitos previos

- Node.js instalado.
- Servidor MySQL (XAMPP, WAMP o local).
- Una base de datos llamada `crud_articulos_db` con las tablas `usuarios` y `articulo`.

## 🚀 Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/kennethdavidlopezgsanjosemlg-ux/euronutra-inventor.git
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura la base de datos en `database/db.js`.
4.  Inicia la aplicación:
    ```bash
    node app.js
    ```
5.  Accede a `http://localhost:3000`.

---
**Realizado por Kenneth David López Guerrero**

---
*Nota: Este proyecto fue desarrollado para optimizar los procesos de almacén de Euronutra.*