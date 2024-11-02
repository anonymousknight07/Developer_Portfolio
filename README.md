# Modern Portfolio Website
![portfolio](https://github.com/user-attachments/assets/4b13ebb4-a33d-4971-9bf6-0821f7fbba90)

A feature-rich portfolio website built with Next.js 13+, TypeScript, and Tailwind CSS.

## 📁 Project Structure

```
├── pages/
│   └── api/
│       └── sendEmail.js
├── public/
├── src/
│   ├── app/
│   ├── components/
│   └── utils/
├── .env.local
├── .eslintrc.json
├── .gitignore
├── next-env.d.ts
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

## 🔧 Configuration Files

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-image-domain.com'],
  },
}

module.exports = nextConfig
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#1a1a1a',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}
export default config
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### .eslintrc.json
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### .env.local
```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Other Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### .gitignore
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### pages/api/sendEmail.js
```javascript
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Portfolio Contact: ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
}
```

### package.json
```json
{
  "name": "portfolio-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^13.0.0",
    "next": "^13.0.0",
    "nodemailer": "^6.0.0",
    "postcss": "^8.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone <https://github.com/anonymousknight07/Developer_Portfolio.git>
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.local` and fill in your details
- For Gmail, use an App Password instead of your regular password

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📝 Key Features Setup

### Email Service
The email service uses Nodemailer with Gmail. To set this up:
1. Enable 2-factor authentication in your Google account
2. Generate an App Password
3. Use this App Password in your `.env.local` file

### Image Optimization
Next.js handles image optimization automatically. Use the `next/image` component:
```typescript
import Image from 'next/image'

export default function ProfileImage() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={300}
      height={300}
      priority
    />
  )
}
```

### Custom Fonts
To add custom fonts, modify `next.config.js` and use them in your Tailwind configuration.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](issues).

## 👨‍💻 Author

Akshat Pandey
- Website: [akshath.vercel.app]((https://akshath.vercel.app/ )
- GitHub: [@anonymousknight07](https://github.com/anonymousknight07)
- LinkedIn: [/akshatpandey07/](https://www.linkedin.com/in/akshatpandey07/)

## 🌟 Show your support

Give a ⭐️ if this project helped you!

## 📝 Notes

- Ensure all dependencies are up to date
- Follow the Next.js 13+ App Router conventions
- Use TypeScript for better type safety
- Follow Tailwind CSS best practices for styling
