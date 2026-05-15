# SmartOCR - Aadhaar OCR Extraction System 🔍🏛️

SmartOCR is a high-performance, production-ready Aadhaar card data extraction system. Built with **NestJS** and **React**, it leverages advanced OCR technologies to accurately extract text from Aadhaar card images, including Name, Date of Birth, Gender, and Aadhaar Number.

![SmartOCR Banner](https://img.shields.io/badge/SmartOCR-Document%20Scanner-blueviolet?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

## 🚀 Key Features

- **High-Accuracy OCR**: Integrated with [OCR.space API](https://ocr.space/) for robust text recognition.
- **Image Optimization**: Automatic image resizing and quality adjustment using `sharp` to ensure optimal API performance.
- **Data Validation**: Sophisticated parsing logic to extract specific fields like Aadhaar number, DOB, and Address using Regex and NLP patterns.
- **Responsive UI**: A modern, dark-themed React frontend with real-time feedback and toast notifications.
- **Secure Handling**: Integration with Cloudinary for temporary image storage and processing.
- **Type-Safe Development**: End-to-end TypeScript implementation for maximum reliability.

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **Vite** (Next-gen frontend tooling)
- **TypeScript**
- **Axios** (API communication)
- **React Hot Toast** (User feedback)
- **Vanilla CSS** (Custom high-quality design)

### Backend
- **NestJS** (Modular backend framework)
- **TypeScript**
- **OCR.space API** (Primary OCR Engine)
- **Cloudinary** (Image management)
- **Sharp** (Image processing & optimization)
- **Zod** (Schema validation)

## 📂 Project Structure

```bash
SmartOCR/
├── backend/          # NestJS application
│   ├── src/
│   │   ├── modules/  # Aadhaar module, OCR services, Cloudinary config
│   │   └── main.ts   # Entry point
│   └── .env          # Backend environment variables
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── Page/     # Main UI Layouts
│   │   └── App.tsx
│   └── .env          # Frontend environment variables
└── README.md         # Project documentation
```

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- [OCR.space API Key](https://ocr.space/ocrapi)
- [Cloudinary Account](https://cloudinary.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/SmartOCR.git
cd SmartOCR
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=3000
OCR_SPACE_API_KEY=your_ocr_space_key
OCR_API_URL=https://api.ocr.space/parse/image

```
Run the backend:
```bash
npm run start:dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
Run the frontend:
```bash
npm run dev
```

## 📸 Screenshots

> [!TIP]
> Add your application screenshots here to showcase the stunning dark UI!

| Home Page | OCR Result |
| :---: | :---: |
| ![Home](https://via.placeholder.com/400x250?text=SmartOCR+Home) | ![Result](https://via.placeholder.com/400x250?text=OCR+Result) |

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

- **Haranck** - [GitHub](https://github.com/haranck)

---
*Developed with ❤️ for secure and efficient document processing.*
