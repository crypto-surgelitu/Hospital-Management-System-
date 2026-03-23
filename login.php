<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();
$loginError = $_SESSION['login_error'] ?? null;
if ($loginError)
    unset($_SESSION['login_error']);
require_once 'includes/header.php';
?>

<main class="min-h-screen flex animate-fade-up">
    <!-- Left: Hero Panel (Desktop) -->
    <section class="hidden lg:flex lg:w-3/5 mesh-gradient relative items-center justify-center overflow-hidden">
        <!-- Decorative Glows -->
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div class="relative z-10 px-12 text-center max-w-2xl">
            <div
                class="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Meru Level 5 HMS</span>
            </div>

            <h1 class="font-display text-5xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
                Clinical Precision.<br>
                <span class="text-primary italic">Absolute</span> Care.
            </h1>

            <p class="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
                Empowering healthcare professionals with a high-performance editorial dashboard for seamless hospital
                management.
            </p>

            <!-- Quick Stats -->
            <div class="flex items-center justify-center gap-12 mt-16 pt-12 border-t border-white/5">
                <div>
                    <p class="text-3xl font-display font-bold text-white mb-1">2.4k+</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Patients</p>
                </div>
                <div class="w-px h-10 bg-white/10"></div>
                <div>
                    <p class="text-3xl font-display font-bold text-white mb-1">98.9%</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime Record</p>
                </div>
            </div>
        </div>

        <!-- Glass Overlay Pattern -->
        <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-ink-900 to-transparent"></div>
    </section>

    <!-- Right: Login Panel -->
    <section class="w-full lg:w-2/5 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-12 xl:px-24 py-12">
        <div class="max-w-md mx-auto w-full">
            <!-- Mobile Logo -->
            <div class="lg:hidden mb-12 flex items-center gap-3">
                <div
                    class="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-ink-900 font-display font-bold text-xl">
                    M</div>
                <div>
                    <h2 class="font-display font-bold text-lg text-ink-900 leading-none">HMS Meru</h2>
                    <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Meru Level 5</span>
                </div>
            </div>

            <!-- Welcome Text -->
            <div class="mb-10">
                <h2 class="text-3xl font-display font-extrabold text-ink-900 mb-2">Welcome Back</h2>
                <p class="text-slate-500 font-medium">Please enter your clinical credentials to continue.</p>
            </div>

            <?php if ($loginError): ?>
                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-custom">
                    <p class="text-sm text-red-600 font-medium"><?= htmlspecialchars($loginError) ?></p>
                </div>
            <?php endif; ?>

            <!-- Login Form -->
            <!-- ACTION: Minimax wires this — see backend-s00.md -->
            <form id="login-form" method="POST" action="modules/auth/login.php" class="space-y-6">
                <!-- Username -->
                <div>
                    <label for="username"
                        class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Staff
                        Username</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <i class="bi bi-person text-lg"></i>
                        </span>
                        <input type="text" id="username" name="username" required
                            class="w-full pl-12 pr-4 py-3.5 bg-surface rounded-custom border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                            placeholder="e.g. j.doe@hms.meru">
                    </div>
                </div>

                <!-- Password -->
                <div>
                    <div class="flex items-center justify-between mb-2 px-1">
                        <label for="password"
                            class="block text-xs font-bold uppercase tracking-widest text-slate-500">Access Key</label>
                        <a href="#" class="text-[10px] font-bold text-primary uppercase hover:underline">Forgot?</a>
                    </div>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <i class="bi bi-shield-lock text-lg"></i>
                        </span>
                        <input type="password" id="password" name="password" required
                            class="w-full pl-12 pr-12 py-3.5 bg-surface rounded-custom border border-transparent focus:border-primary focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                            placeholder="••••••••••••">
                        <button type="button" onclick="togglePasswordVisibility()"
                            class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink-900 transition-colors">
                            <i id="password-toggle-icon" class="bi bi-eye text-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Remember Me -->
                <div class="flex items-center px-1">
                    <input type="checkbox" id="remember"
                        class="w-4 h-4 rounded text-primary focus:ring-primary border-surface-dim">
                    <label for="remember" class="ml-2 text-sm font-medium text-slate-600">Keep me active for 12
                        hours</label>
                </div>

                <!-- Submit Button -->
                <button type="submit"
                    class="w-full py-4 bg-primary hover:bg-primary-dark text-ink-900 font-display font-extrabold text-lg rounded-custom transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20">
                    Authenticate Securely
                </button>
            </form>

            <!-- Help/Footer -->
            <p class="mt-12 text-center text-xs text-slate-400 font-medium">
                System Assistance: <a href="mailto:it@meru-hms.com" class="text-primary hover:underline">Internal IT
                    Support</a>
            </p>
        </div>
    </section>
</main>

<script>
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('password-toggle-icon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('bi-eye');
            toggleIcon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('bi-eye-slash');
            toggleIcon.classList.add('bi-eye');
        }
    }
</script>

</body>

</html>