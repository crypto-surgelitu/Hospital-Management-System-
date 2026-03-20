<?php
/**
 * Global Header Includes
 * Meru Level 5 Hospital Management System
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HMS Meru - Professional Hospital Management</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Flatpickr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            DEFAULT: '#00C9A7',
                            dark: '#006B58',
                            light: '#5FFBD6'
                        },
                        ink: {
                            900: '#080C14',
                            800: '#0D1220',
                            700: '#181C24'
                        },
                        surface: {
                            DEFAULT: '#F0F2F7',
                            card: '#FFFFFF',
                            dim: '#D8DADF'
                        }
                    },
                    fontFamily: {
                        display: ['Syne', 'sans-serif'],
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace']
                    },
                    spacing: {
                        '8': '2rem',
                        '10': '2.5rem',
                        '12': '3rem'
                    },
                    borderRadius: {
                        'custom': '10px',
                        'card': '16px'
                    }
                }
            }
        }
    </script>
    
    <style>
        /* Custom Utilities & Animations */
        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up {
            animation: fadeSlideUp 0.5s ease-out forwards;
        }
        
        .mesh-gradient {
            background-color: #080C14;
            background-image: 
                radial-gradient(at 0% 0%, rgba(0, 201, 167, 0.15) 0, transparent 50%),
                radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.15) 0, transparent 50%);
        }
        
        .glass {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        
        .ghost-border {
            border: 1px solid rgba(186, 202, 195, 0.2);
        }
        
        /* Hide scrollbars but keep functionality */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-surface font-sans text-ink-900 antialiased">
