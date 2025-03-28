// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {

    // --- ESTADO Y DATOS FICTICIOS ---
    const appState = {
        currentView: 'overview',
        mainChart: null,
        isNotificationsOpen: false,
        isSearchOpen: false,
    };
    const chartDataSets = {
        ventas: { '3m': { labels: ['Ene', 'Feb', 'Mar'], data: [15000, 19000, 17500] }, '6m': { labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'], data: [23000, 28000, 25000, 15000, 19000, 17500] }, '12m':{ labels: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'], data: [21000, 18000, 24000, 22000, 26000, 23000, 28000, 30000, 25000, 15000, 19000, 17500] } },
        usuarios: { '3m': { labels: ['Ene', 'Feb', 'Mar'], data: [1100, 1250, 1180] }, '6m': { labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'], data: [950, 1050, 1000, 1100, 1250, 1180] }, '12m':{ labels: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'], data: [800, 850, 900, 920, 1000, 950, 1050, 1100, 1000, 1100, 1250, 1180] } }
    };
    const chartConfig = {
        colors: { textSecondary: '#6c757d', border: '#e9ecef', surface: '#ffffff', tooltipBg: '#343a40', tooltipText: '#ffffff', line: { ventas: '#ff9f40', usuarios: '#4f46e5' }, gradient: { ventas: { start: 'rgba(255, 199, 0, 0.5)', mid: 'rgba(255, 159, 64, 0.3)', end: 'rgba(255, 99, 132, 0.1)'}, usuarios: { start: 'rgba(79, 70, 229, 0.4)', mid: 'rgba(79, 70, 229, 0.2)', end: 'rgba(79, 70, 229, 0.05)'} }, pie: [ 'rgba(79, 70, 229, 0.8)', 'rgba(37, 99, 235, 0.8)', 'rgba(21, 128, 61, 0.8)', 'rgba(217, 119, 6, 0.8)', 'rgba(107, 114, 128, 0.8)' ], bar: [ 'rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(139, 92, 246, 0.8)' ] },
        borderRadiusSm: 4,
        currencyFormatter: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }),
        numberFormatter: new Intl.NumberFormat('es-CL')
    };

    // --- DOM Elements ---
    const loader = document.getElementById('loader');
    const modalOverlay = document.getElementById('modal-overlay');
    const logoutModal = document.getElementById('logout-modal');
    const createReportModal = document.getElementById('create-report-modal');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.querySelector('.search-container');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationsBtn = document.getElementById('notifications-btn');

    // --- FUNCIONES AUXILIARES ---
    function createGradient(ctx, chartArea, gradientColors) { if (!chartArea) return null; const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top); gradient.addColorStop(0, gradientColors.end); gradient.addColorStop(0.4, gradientColors.mid); gradient.addColorStop(1, gradientColors.start); return gradient; }
    function updateChart(chart, newLabels, newData, newDataType = 'ventas') { if (!chart) return; chart.data.labels = newLabels; chart.data.datasets[0].data = newData; const lineColor = chartConfig.colors.line[newDataType] || chartConfig.colors.line.ventas; const gradientColors = chartConfig.colors.gradient[newDataType] || chartConfig.colors.gradient.ventas; chart.data.datasets[0].borderColor = lineColor; chart.data.datasets[0].pointBackgroundColor = lineColor; const { ctx, chartArea } = chart; chart.data.datasets[0].backgroundColor = createGradient(ctx, chartArea, gradientColors); chart.options.plugins.tooltip.callbacks.label = function(context) { const value = context.parsed.y; if (newDataType === 'ventas') { return `Ventas: ${chartConfig.currencyFormatter.format(value)}`; } else { return `Usuarios: ${chartConfig.numberFormatter.format(value)}`; } }; chart.options.scales.y.ticks.callback = function(value) { if (newDataType === 'ventas') { return '$' + (value / 1000) + 'k'; } else { return chartConfig.numberFormatter.format(value); } }; chart.update(); }
    function switchView(targetViewId) { if (appState.currentView === targetViewId) return; const viewsContainer = document.querySelector('.views-container'); const currentActiveView = viewsContainer.querySelector('.view-section.active'); const nextActiveView = document.getElementById(targetViewId + '-view'); const mainTitle = document.getElementById('main-title'); const mainSubtitle = document.getElementById('main-subtitle'); const navLinks = document.querySelectorAll('.nav-menu a'); navLinks.forEach(link => { if (link.dataset.view === targetViewId) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); const titleText = link.querySelector('span')?.textContent || 'Dashboard'; mainTitle.textContent = titleText; mainSubtitle.textContent = `Detalles y gestión de ${titleText.toLowerCase()}.`; } else { link.classList.remove('active'); link.removeAttribute('aria-current'); } }); if (currentActiveView) { currentActiveView.classList.remove('active'); currentActiveView.classList.add('hidden'); } if (nextActiveView) { nextActiveView.classList.remove('hidden'); nextActiveView.classList.add('active'); } else { console.warn(`Vista con ID '${targetViewId}-view' no encontrada.`); const defaultView = document.getElementById('overview-view'); if (defaultView && currentActiveView !== defaultView) { defaultView.classList.remove('hidden'); defaultView.classList.add('active'); mainTitle.textContent = 'Visión General Analítica'; mainSubtitle.textContent = 'Resumen de métricas clave y tendencias.'; document.querySelector('.nav-menu a[data-view="overview"]')?.setAttribute('aria-current', 'page'); } } appState.currentView = targetViewId; console.log(`Vista cambiada a: ${targetViewId}`); }
    function applyFilters() { const dataTypeSelect = document.getElementById('data-type-filter'); const rangeSelect = document.getElementById('range-filter'); const statusButtons = document.querySelectorAll('#main-chart-filters .filter-button[data-filter-type="status"]'); const selectedDataType = dataTypeSelect ? dataTypeSelect.value : 'ventas'; const selectedRange = rangeSelect ? rangeSelect.value : '6m'; let selectedStatus = 'actual'; statusButtons.forEach(button => { if (button.classList.contains('active')) { selectedStatus = button.dataset.filterValue; } }); console.log(`Aplicando filtros: Tipo=${selectedDataType}, Rango=${selectedRange}, Estado=${selectedStatus}`); const dataSet = chartDataSets[selectedDataType] ? chartDataSets[selectedDataType][selectedRange] : null; if (dataSet && appState.mainChart) { if (selectedStatus === 'today') { console.log("Mostrando datos de 'Hoy' (simulado como vacío)"); updateChart(appState.mainChart, ['Hoy'], [0], selectedDataType); } else { updateChart(appState.mainChart, dataSet.labels, dataSet.data, selectedDataType); } } else { console.error("No se pudieron encontrar datos para los filtros seleccionados o el gráfico principal no está inicializado."); } }
    function openModal(modalElement) { if (modalElement && modalOverlay) { modalOverlay.classList.remove('hidden'); modalElement.classList.remove('hidden'); const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'); if (firstFocusable) { firstFocusable.focus(); } } }
    function closeModal() { if (modalOverlay) { modalOverlay.classList.add('hidden'); } document.querySelectorAll('.modal').forEach(modal => { modal.classList.add('hidden'); }); }
    function toggleNotifications() { if (notificationsDropdown) { const isHidden = notificationsDropdown.classList.toggle('hidden'); appState.isNotificationsOpen = !isHidden; notificationsBtn.setAttribute('aria-expanded', String(!isHidden)); if (notificationBadge) { notificationBadge.classList.toggle('hidden', !isHidden); } if (appState.isNotificationsOpen && appState.isSearchOpen) { closeSearch(); } } }
    function closeNotifications() { if (notificationsDropdown && !notificationsDropdown.classList.contains('hidden')) { notificationsDropdown.classList.add('hidden'); appState.isNotificationsOpen = false; notificationsBtn.setAttribute('aria-expanded', 'false'); if (notificationBadge) { notificationBadge.classList.remove('hidden'); } } }
    function toggleSearch() { if (searchInput && searchContainer) { const isHidden = searchInput.classList.toggle('hidden'); appState.isSearchOpen = !isHidden; searchContainer.classList.toggle('search-active', !isHidden); if (!isHidden) { searchInput.focus(); if (appState.isNotificationsOpen) { closeNotifications(); } } } }
    function closeSearch() { if (searchInput && searchContainer && !searchInput.classList.contains('hidden')) { searchInput.classList.add('hidden'); searchContainer.classList.remove('search-active'); appState.isSearchOpen = false; } }

    // --- INICIALIZACIÓN DE GRÁFICOS ---
    function initCharts() {
        const ctxTendencia = document.getElementById('tendenciaChart')?.getContext('2d'); if (ctxTendencia) { const initialDataType = 'ventas'; const initialRange = '6m'; const initialData = chartDataSets[initialDataType][initialRange]; const initialLineColor = chartConfig.colors.line[initialDataType]; const initialGradientColors = chartConfig.colors.gradient[initialDataType]; appState.mainChart = new Chart(ctxTendencia, { type: 'line', data: { labels: initialData.labels, datasets: [{ label: 'Valor', data: initialData.data, borderColor: initialLineColor, borderWidth: 3, pointBackgroundColor: initialLineColor, pointBorderColor: chartConfig.colors.surface, pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, fill: true, tension: 0.4, backgroundColor: (context) => { const { ctx, chartArea } = context.chart; return createGradient(ctx, chartArea, initialGradientColors); } }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, grid: { color: chartConfig.colors.border, drawBorder: false }, ticks: { padding: 10, color: chartConfig.colors.textSecondary, callback: function(value) { if (initialDataType === 'ventas') return '$' + (value / 1000) + 'k'; else return chartConfig.numberFormatter.format(value); } } }, x: { grid: { display: false }, ticks: { padding: 10, color: chartConfig.colors.textSecondary } } }, plugins: { legend: { display: false }, tooltip: { backgroundColor: chartConfig.colors.tooltipBg, titleColor: chartConfig.colors.tooltipText, bodyColor: chartConfig.colors.tooltipText, padding: 10, cornerRadius: chartConfig.borderRadiusSm, displayColors: false, callbacks: { label: function(context) { const value = context.parsed.y; if (initialDataType === 'ventas') return `Ventas: ${chartConfig.currencyFormatter.format(value)}`; else return `Usuarios: ${chartConfig.numberFormatter.format(value)}`; } } } } } }); } else { console.error("Elemento canvas 'tendenciaChart' no encontrado."); }
        const ctxResumen1 = document.getElementById('resumen1Chart')?.getContext('2d'); if (ctxResumen1) { new Chart(ctxResumen1, { type: 'doughnut', data: { labels: ['Norte', 'Sur', 'Centro', 'Este', 'Oeste'], datasets: [{ label: 'Distribución', data: [45, 25, 15, 10, 5], backgroundColor: chartConfig.colors.pie, borderColor: chartConfig.colors.surface, borderWidth: 2, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { padding: 15, boxWidth: 12, color: chartConfig.colors.textSecondary } }, tooltip: { backgroundColor: chartConfig.colors.tooltipBg, titleColor: chartConfig.colors.tooltipText, bodyColor: chartConfig.colors.tooltipText, padding: 8, cornerRadius: chartConfig.borderRadiusSm, callbacks: { label: (c) => `${c.label}: ${c.parsed}%` } } } } }); } else { console.error("Elemento canvas 'resumen1Chart' no encontrado."); }
        const ctxResumen2 = document.getElementById('resumen2Chart')?.getContext('2d'); if (ctxResumen2) { new Chart(ctxResumen2, { type: 'bar', data: { labels: ['Orgánico', 'Social', 'Referido', 'Directo'], datasets: [{ label: '% Tráfico', data: [55, 25, 15, 5], backgroundColor: chartConfig.colors.bar, borderColor: chartConfig.colors.bar, borderWidth: 1, borderRadius: chartConfig.borderRadiusSm, barThickness: 20 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, grid: { display: false, drawBorder: false }, ticks: { display: false } }, y: { grid: { display: false, drawBorder: false }, ticks: { color: chartConfig.colors.textSecondary, padding: 5 } } }, plugins: { legend: { display: false }, tooltip: { backgroundColor: chartConfig.colors.tooltipBg, titleColor: chartConfig.colors.tooltipText, bodyColor: chartConfig.colors.tooltipText, padding: 8, cornerRadius: chartConfig.borderRadiusSm, callbacks: { label: (c) => `${c.parsed.x}%` } } } } }); } else { console.error("Elemento canvas 'resumen2Chart' no encontrado."); }
    }

    // --- CONFIGURACIÓN DE EVENT LISTENERS ---
    function setupEventListeners() {
        document.querySelector('.nav-menu')?.addEventListener('click', (event) => { const link = event.target.closest('a[data-view]'); if (link) { event.preventDefault(); switchView(link.dataset.view); } });
        const mainChartFilters = document.getElementById('main-chart-filters'); if (mainChartFilters) { mainChartFilters.addEventListener('change', (event) => { if (event.target.tagName === 'SELECT') applyFilters(); }); mainChartFilters.addEventListener('click', (event) => { const button = event.target.closest('button.filter-button'); if (button) { if (button.dataset.filterType === 'status') { mainChartFilters.querySelectorAll('.filter-button[data-filter-type="status"]').forEach(btn => btn.classList.remove('active')); button.classList.add('active'); } applyFilters(); } }); }
        document.getElementById('logout-btn')?.addEventListener('click', () => openModal(logoutModal));
        document.getElementById('logout-cancel-btn')?.addEventListener('click', closeModal);
        document.getElementById('logout-confirm-btn')?.addEventListener('click', () => { console.log("Cierre de sesión confirmado (simulado)."); closeModal(); });
        document.getElementById('create-report-btn')?.addEventListener('click', () => openModal(createReportModal));
        document.getElementById('create-report-cancel-btn')?.addEventListener('click', closeModal);
        document.getElementById('create-report-confirm-btn')?.addEventListener('click', () => { const form = document.getElementById('create-report-form'); const selectedType = form ? form.querySelector('input[name="reportType"]:checked')?.value : 'ninguno'; console.log(`Creando reporte (simulado): Tipo = ${selectedType}`); closeModal(); });
        notificationsBtn?.addEventListener('click', (event) => { event.stopPropagation(); toggleNotifications(); });
        searchBtn?.addEventListener('click', (event) => { event.stopPropagation(); toggleSearch(); });
        searchInput?.addEventListener('keyup', (event) => { if (event.key === 'Enter') { console.log(`Buscando (simulado): ${searchInput.value}`); closeSearch(); } else if (event.key === 'Escape') { closeSearch(); } });
        document.addEventListener('click', (event) => { if (appState.isNotificationsOpen && !notificationsDropdown.contains(event.target) && !notificationsBtn.contains(event.target)) { closeNotifications(); } if (appState.isSearchOpen && !searchInput.contains(event.target) && !searchBtn.contains(event.target) && !searchContainer.contains(event.target) ) { closeSearch(); } if (event.target === modalOverlay) { closeModal(); } });
        document.addEventListener('keyup', (event) => { if (event.key === 'Escape') { closeModal(); closeNotifications(); closeSearch(); } });
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }

    // --- INICIALIZACIÓN DASHBOARD ---
    function initDashboard() {
        console.log("Inicializando dashboard...");
        if(loader) loader.classList.remove('hidden');

        initCharts();
        setupEventListeners();
        switchView(appState.currentView);
        applyFilters();

        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
                 loader.addEventListener('transitionend', () => { /* loader.remove(); */ }, { once: true });
            }
             console.log("Dashboard listo.");
        }, 500); // Retraso simulado
    }

    // Arrancar la aplicación
    initDashboard();

});