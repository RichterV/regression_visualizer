
document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    let currentModel = 'linear';
    let coefficients = {
        linear: { b0: 0, b1: 1 },
        quadratic: { b0: 0, b1: 1, b2: 0 }
    };

    // Chart setup
    const ctx = document.getElementById('regression-chart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Regression Curve',
                data: [],
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                fill: false,
                showLine: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300,
                easing: 'easeOutQuad'
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'x',
                        color: '#065f46',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: '#d1fae5'
                    },
                    ticks: {
                        color: '#065f46'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    title: {
                        display: true,
                        text: 'y',
                        color: '#065f46',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: '#d1fae5'
                    },
                    ticks: {
                        color: '#065f46'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false,
                    external: function (context) {
                        const tooltip = document.getElementById('chart-tooltip');
                        if (context.tooltip.opacity === 0) {
                            tooltip.style.opacity = 0;
                            return;
                        }

                        const data = context.tooltip.dataPoints[0];
                        const x = data.parsed.x;
                        const y = data.parsed.y;

                        tooltip.innerHTML = `x: ${x.toFixed(2)}<br>y: ${y.toFixed(2)}`;
                        tooltip.style.left = context.tooltip.caretX + 'px';
                        tooltip.style.top = context.tooltip.caretY + 'px';
                        tooltip.style.opacity = 1;
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Initialize UI
    function initUI() {
        updateSliders();
        updateEquationDisplay();
        updateChart();
    }

    // Update sliders based on current model
    function updateSliders() {
        const container = document.getElementById('sliders-container');
        container.innerHTML = '';

        const coeffs = coefficients[currentModel];
        const sliderTemplate = (name, label, value, min = -10, max = 10, step = 0.1) => `
            <div class="fade-in">
                <label class="block text-emerald-700 font-medium mb-2">${label}</label>
                <div class="flex items-center space-x-4">
                    <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" 
                            class="slider-thumb w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer" 
                            id="${name}-slider">
                    <span class="text-emerald-800 font-mono w-16 text-right" id="${name}-value">${value.toFixed(2)}</span>
                </div>
            </div>
        `;

        if (currentModel === 'linear') {
            container.innerHTML += sliderTemplate('b0', 'Intercept (β₀)', coeffs.b0);
            container.innerHTML += sliderTemplate('b1', 'Slope (β₁)', coeffs.b1);
        } else {
            container.innerHTML += sliderTemplate('b0', 'Intercept (β₀)', coeffs.b0);
            container.innerHTML += sliderTemplate('b1', 'Linear (β₁)', coeffs.b1);
            container.innerHTML += sliderTemplate('b2', 'Quadratic (β₂)', coeffs.b2, -5, 5);
        }

        // Add event listeners to new sliders
        Object.keys(coeffs).forEach(coeff => {
            document.getElementById(`${coeff}-slider`).addEventListener('input', function () {
                coefficients[currentModel][coeff] = parseFloat(this.value);
                document.getElementById(`${coeff}-value`).textContent = this.value;
                updateEquationDisplay();
                updateChart();
            });
        });
    }

    // Update the equation display
    function updateEquationDisplay() {
        const coeffs = coefficients[currentModel];
        let equation;

        if (currentModel === 'linear') {
            equation = `y = ${coeffs.b0.toFixed(2)} + ${coeffs.b1.toFixed(2)}x`;
        } else {
            equation = `y = ${coeffs.b0.toFixed(2)} + ${coeffs.b1.toFixed(2)}x + ${coeffs.b2.toFixed(2)}x²`;
        }

        document.getElementById('equation-display').textContent = equation;
    }

    // Update the chart with current coefficients
    function updateChart() {
        const coeffs = coefficients[currentModel];
        const points = [];

        // Generate points for the curve
        for (let x = -10; x <= 10; x += 0.5) {
            let y;

            if (currentModel === 'linear') {
                y = coeffs.b0 + coeffs.b1 * x;
            } else {
                y = coeffs.b0 + coeffs.b1 * x + coeffs.b2 * Math.pow(x, 2);
            }

            points.push({ x, y });
        }

        // Update chart data
        chart.data.datasets[0].data = points;

        // Adjust y-axis scale based on curve range
        const yValues = points.map(p => p.y);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        const padding = Math.max(2, (yMax - yMin) * 0.2);

        chart.options.scales.y.min = yMin - padding;
        chart.options.scales.y.max = yMax + padding;

        chart.update();
    }

    // Event listeners
    document.getElementById('model-select').addEventListener('change', function () {
        currentModel = this.value;
        initUI();
    });

    document.getElementById('reset-btn').addEventListener('click', function () {
        if (currentModel === 'linear') {
            coefficients.linear = { b0: 0, b1: 1 };
        } else {
            coefficients.quadratic = { b0: 0, b1: 1, b2: 0 };
        }
        initUI();
    });

    // Initialize
    initUI();
});
