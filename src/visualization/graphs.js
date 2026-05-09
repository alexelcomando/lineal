/**
 * Módulo de Gráficos Matemáticos
 * Implementación de visualizaciones de funciones matemáticas y análisis de datos
 */

export class MathematicalGraphs {
    /**
     * Visualiza una función matemática 2D
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Function} function - Función a graficar f(x)
     * @param {Object} options - Opciones de visualización
     */
    static plotFunction2D(canvas, mathFunction, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            xMin = -10,
            xMax = 10,
            samples = 200,
            color = '#3498db',
            lineWidth = 2,
            showGrid = true,
            showAxes = true,
            showLabels = true
        } = options;
        
        canvas.width = 400;
        canvas.height = 300;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        const xScale = canvas.width / (xMax - xMin);
        const yScale = canvas.height / (xMax - xMin); // Mismo escala para Y
        
        // Dibujar grid
        if (showGrid) {
            this.drawGrid(ctx, canvas.width, canvas.height, xScale, yScale, origin);
        }
        
        // Dibujar ejes
        if (showAxes) {
            this.drawAxes(ctx, origin, canvas.width, canvas.height);
        }
        
        // Calcular puntos de la función
        const points = [];
        const step = (xMax - xMin) / samples;
        
        for (let i = 0; i <= samples; i++) {
            const x = xMin + i * step;
            try {
                const y = mathFunction(x);
                
                if (!isNaN(y) && isFinite(y)) {
                    const screenX = origin.x + x * xScale;
                    const screenY = origin.y - y * yScale;
                    
                    points.push({ x: screenX, y: screenY, mathX: x, mathY: y });
                }
            } catch (error) {
                // Ignorar puntos donde la función no está definida
            }
        }
        
        // Dibujar función
        if (points.length > 0) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            
            let started = false;
            for (const point of points) {
                if (!started) {
                    ctx.moveTo(point.x, point.y);
                    started = true;
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            
            ctx.stroke();
        }
        
        // Mostrar etiquetas
        if (showLabels) {
            this.drawFunctionLabels(ctx, origin, xMin, xMax, xScale, yScale);
        }
        
        return {
            canvas: canvas,
            function: mathFunction,
            points: points,
            domain: { xMin, xMax },
            scale: { x: xScale, y: yScale }
        };
    }
    
    /**
     * Dibuja grid para gráficos
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} width - Ancho del canvas
     * @param {number} height - Alto del canvas
     * @param {number} xScale - Escala en X
     * @param {number} yScale - Escala en Y
     * @param {Object} origin - Origen de coordenadas
     */
    static drawGrid(ctx, width, height, xScale, yScale, origin) {
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x <= width; x += xScale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= height; y += yScale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    /**
     * Dibuja ejes coordenados
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen
     * @param {number} width - Ancho
     * @param {number} height - Alto
     */
    static drawAxes(ctx, origin, width, height) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(0, origin.y);
        ctx.lineTo(width, origin.y);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(origin.x, 0);
        ctx.lineTo(origin.x, height);
        ctx.stroke();
        
        // Flechas
        this.drawArrow(ctx, width - 10, origin.y, width, origin.y);
        this.drawArrow(ctx, origin.x, 10, origin.x, 0);
    }
    
    /**
     * Dibuja una flecha
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} fromX - X inicial
     * @param {number} fromY - Y inicial
     * @param {number} toX - X final
     * @param {number} toY - Y final
     */
    static drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Dibuja etiquetas de ejes
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen
     * @param {number} xMin - Mínimo en X
     * @param {number} xMax - Máximo en X
     * @param {number} xScale - Escala en X
     * @param {number} yScale - Escala en Y
     */
    static drawFunctionLabels(ctx, origin, xMin, xMax, xScale, yScale) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Etiquetas en X
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            if (x !== 0) {
                const screenX = origin.x + x * xScale;
                ctx.fillText(x.toString(), screenX, origin.y + 20);
            }
        }
        
        // Etiquetas en Y
        ctx.textAlign = 'right';
        for (let y = Math.ceil(xMin); y <= Math.floor(xMax); y++) {
            if (y !== 0) {
                const screenY = origin.y - y * yScale;
                ctx.fillText(y.toString(), origin.x - 10, screenY + 5);
            }
        }
        
        // Etiquetas de ejes
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X', ctx.canvas.width - 20, origin.y - 10);
        ctx.fillText('Y', origin.x + 20, 20);
    }
    
    /**
     * Visualiza superficie 3D (proyección 2D)
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Function} surfaceFunction - Función de superficie f(x, y)
     * @param {Object} options - Opciones de visualización
     */
    static plotSurface3D(canvas, surfaceFunction, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            xMin = -5,
            xMax = 5,
            yMin = -5,
            yMax = 5,
            resolution = 20,
            colorMap = 'viridis',
            showWireframe = true,
            showContours = false
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        const xScale = canvas.width / (xMax - xMin) * 0.8;
        const yScale = canvas.height / (yMax - yMin) * 0.8;
        
        // Generar puntos de la superficie
        const surfacePoints = [];
        const stepX = (xMax - xMin) / resolution;
        const stepY = (yMax - yMin) / resolution;
        
        let zMin = Infinity, zMax = -Infinity;
        
        // Calcular puntos y encontrar rango Z
        for (let i = 0; i <= resolution; i++) {
            surfacePoints[i] = [];
            for (let j = 0; j <= resolution; j++) {
                const x = xMin + i * stepX;
                const y = yMin + j * stepY;
                
                try {
                    const z = surfaceFunction(x, y);
                    
                    if (!isNaN(z) && isFinite(z)) {
                        surfacePoints[i][j] = { x, y, z };
                        zMin = Math.min(zMin, z);
                        zMax = Math.max(zMax, z);
                    } else {
                        surfacePoints[i][j] = null;
                    }
                } catch (error) {
                    surfacePoints[i][j] = null;
                }
            }
        }
        
        // Función de color
        const colorFunction = this.getColorMapFunction(colorMap);
        const zRange = zMax - zMin;
        
        // Dibujar superficie
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const point = surfacePoints[i][j];
                const nextPoint = surfacePoints[i + 1][j];
                const belowPoint = surfacePoints[i][j + 1];
                
                if (point && nextPoint && belowPoint) {
                    // Proyección isométrica simple
                    const screenX = origin.x + (point.x - point.y) * xScale * 0.7;
                    const screenY = origin.y - (point.x + point.y) * yScale * 0.4 - point.z * 20;
                    
                    const nextScreenX = origin.x + (nextPoint.x - nextPoint.y) * xScale * 0.7;
                    const nextScreenY = origin.y - (nextPoint.x + nextPoint.y) * yScale * 0.4 - nextPoint.z * 20;
                    
                    const belowScreenX = origin.x + (belowPoint.x - belowPoint.y) * xScale * 0.7;
                    const belowScreenY = origin.y - (belowPoint.x + belowPoint.y) * yScale * 0.4 - belowPoint.z * 20;
                    
                    // Color basado en altura
                    const normalizedZ = zRange > 0 ? (point.z - zMin) / zRange : 0.5;
                    const color = colorFunction(normalizedZ);
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    
                    if (showWireframe) {
                        // Línea horizontal
                        ctx.beginPath();
                        ctx.moveTo(screenX, screenY);
                        ctx.lineTo(nextScreenX, nextScreenY);
                        ctx.stroke();
                        
                        // Línea vertical
                        ctx.beginPath();
                        ctx.moveTo(screenX, screenY);
                        ctx.lineTo(belowScreenX, belowScreenY);
                        ctx.stroke();
                    }
                }
            }
        }
        
        return {
            canvas: canvas,
            surfaceFunction: surfaceFunction,
            points: surfacePoints,
            zRange: { min: zMin, max: zMax }
        };
    }
    
    /**
     * Obtiene función de mapa de colores
     * @param {string} colorMap - Nombre del mapa de colores
     * @returns {Function} Función de mapeo de color
     */
    static getColorMapFunction(colorMap) {
        const colorMaps = {
            viridis: (t) => {
                const r = Math.floor(68 + 48 * t);
                const g = Math.floor(1 + 118 * t);
                const b = Math.floor(84 + 43 * t);
                return `rgb(${r}, ${g}, ${b})`;
            },
            plasma: (t) => {
                const r = Math.floor(13 + 235 * t);
                const g = Math.floor(8 + 84 * t);
                const b = Math.floor(135 + 120 * t);
                return `rgb(${r}, ${g}, ${b})`;
            },
            hot: (t) => {
                const r = Math.floor(255 * Math.min(1, t * 3));
                const g = Math.floor(255 * Math.max(0, Math.min(1, t * 3 - 1)));
                const b = Math.floor(255 * Math.max(0, t * 3 - 2));
                return `rgb(${r}, ${g}, ${b})`;
            },
            cool: (t) => {
                const r = Math.floor(t * 255);
                const g = Math.floor(255 * (1 - t));
                const b = 255;
                return `rgb(${r}, ${g}, ${b})`;
            }
        };
        
        return colorMaps[colorMap] || colorMaps.viridis;
    }
    
    /**
     * Visualiza curvas de nivel (contornos)
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Function} contourFunction - Función f(x, y)
     * @param {Object} options - Opciones de visualización
     */
    static plotContours(canvas, contourFunction, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            xMin = -5,
            xMax = 5,
            yMin = -5,
            yMax = 5,
            levels = 10,
            resolution = 50,
            colorMap = 'viridis'
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        const xScale = canvas.width / (xMax - xMin);
        const yScale = canvas.height / (yMax - yMin);
        
        // Evaluar función en grid
        const grid = [];
        const stepX = (xMax - xMin) / resolution;
        const stepY = (yMax - yMin) / resolution;
        
        let zMin = Infinity, zMax = -Infinity;
        
        for (let i = 0; i <= resolution; i++) {
            grid[i] = [];
            for (let j = 0; j <= resolution; j++) {
                const x = xMin + i * stepX;
                const y = yMin + j * stepY;
                
                try {
                    const z = contourFunction(x, y);
                    
                    if (!isNaN(z) && isFinite(z)) {
                        grid[i][j] = z;
                        zMin = Math.min(zMin, z);
                        zMax = Math.max(zMax, z);
                    } else {
                        grid[i][j] = null;
                    }
                } catch (error) {
                    grid[i][j] = null;
                }
            }
        }
        
        // Generar niveles de contorno
        const contourLevels = [];
        for (let i = 0; i < levels; i++) {
            contourLevels.push(zMin + (zMax - zMin) * i / (levels - 1));
        }
        
        // Función de color
        const colorFunction = this.getColorMapFunction(colorMap);
        
        // Dibujar contornos
        for (const level of contourLevels) {
            const normalizedLevel = (level - zMin) / (zMax - zMin);
            const color = colorFunction(normalizedLevel);
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            // Algoritmo simple de marching squares
            for (let i = 0; i < resolution; i++) {
                for (let j = 0; j < resolution; j++) {
                    const corners = [
                        grid[i][j],
                        grid[i + 1][j],
                        grid[i + 1][j + 1],
                        grid[i][j + 1]
                    ];
                    
                    if (corners.every(corner => corner !== null)) {
                        const contourSegments = this.marchingSquares(corners, level);
                        
                        for (const segment of contourSegments) {
                            const x1 = origin.x + (xMin + (i + segment.x1) * stepX) * xScale;
                            const y1 = origin.y - (yMin + (j + segment.y1) * stepY) * yScale;
                            const x2 = origin.x + (xMin + (i + segment.x2) * stepX) * xScale;
                            const y2 = origin.y - (yMin + (j + segment.y2) * stepY) * yScale;
                            
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                        }
                    }
                }
            }
        }
        
        return {
            canvas: canvas,
            contourFunction: contourFunction,
            levels: contourLevels,
            zRange: { min: zMin, max: zMax }
        };
    }
    
    /**
     * Implementación simplificada de marching squares
     * @param {Array<number>} corners - Valores en las esquinas
     * @param {number} level - Nivel de contorno
     * @returns {Array<Object>} Segmentos de contorno
     */
    static marchingSquares(corners, level) {
        const segments = [];
        
        // Determinar configuración
        let config = 0;
        for (let i = 0; i < 4; i++) {
            if (corners[i] > level) {
                config |= (1 << i);
            }
        }
        
        // Tabla de marching squares simplificada
        const marchingTable = {
            0: [], 1: [{x1: 0.5, y1: 0, x2: 0, y2: 0.5}],
            2: [{x1: 1, y1: 0.5, x2: 0.5, y2: 0}],
            3: [{x1: 1, y1: 0.5, x2: 0, y2: 0.5}],
            4: [{x1: 0.5, y1: 1, x2: 1, y2: 0.5}],
            5: [{x1: 0.5, y1: 0, x2: 0.5, y2: 1}, {x1: 0, y1: 0.5, x2: 1, y2: 0.5}],
            6: [{x1: 0.5, y1: 1, x2: 0.5, y2: 0}],
            7: [{x1: 0.5, y1: 1, x2: 0, y2: 0.5}],
            8: [{x1: 0, y1: 0.5, x2: 0.5, y2: 1}],
            9: [{x1: 0.5, y1: 0, x2: 0.5, y2: 1}],
            10: [{x1: 0, y1: 0.5, x2: 1, y2: 0.5}, {x1: 0.5, y1: 0, x2: 0.5, y2: 1}],
            11: [{x1: 1, y1: 0.5, x2: 0.5, y2: 1}],
            12: [{x1: 0, y1: 0.5, x2: 1, y2: 0.5}],
            13: [{x1: 0.5, y1: 0, x2: 1, y2: 0.5}],
            14: [{x1: 1, y1: 0.5, x2: 0.5, y2: 0}],
            15: []
        };
        
        return marchingTable[config] || [];
    }
    
    /**
     * Visualiza diagrama de dispersión
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<Object>} data - Array de puntos {x, y}
     * @param {Object} options - Opciones de visualización
     */
    static plotScatter(canvas, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            color = '#3498db',
            pointSize = 4,
            showRegression = false,
            showGrid = true,
            xMin = null,
            xMax = null,
            yMin = null,
            yMax = null
        } = options;
        
        canvas.width = 400;
        canvas.height = 300;
        
        // Calcular límites automáticos
        const xValues = data.map(point => point.x);
        const yValues = data.map(point => point.y);
        
        const actualXMin = xMin !== null ? xMin : Math.min(...xValues);
        const actualXMax = xMax !== null ? xMax : Math.max(...xValues);
        const actualYMin = yMin !== null ? yMin : Math.min(...yValues);
        const actualYMax = yMax !== null ? yMax : Math.max(...yValues);
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        const xScale = canvas.width / (actualXMax - actualXMin) * 0.8;
        const yScale = canvas.height / (actualYMax - actualYMin) * 0.8;
        
        // Dibujar grid
        if (showGrid) {
            this.drawGrid(ctx, canvas.width, canvas.height, xScale, yScale, origin);
        }
        
        // Dibujar ejes
        this.drawAxes(ctx, origin, canvas.width, canvas.height);
        
        // Dibujar puntos
        ctx.fillStyle = color;
        for (const point of data) {
            const screenX = origin.x + (point.x - (actualXMin + actualXMax) / 2) * xScale;
            const screenY = origin.y - (point.y - (actualYMin + actualYMax) / 2) * yScale;
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, pointSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dibujar línea de regresión
        if (showRegression && data.length > 1) {
            const regression = this.calculateLinearRegression(data);
            
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const x1 = actualXMin;
            const y1 = regression.slope * x1 + regression.intercept;
            const x2 = actualXMax;
            const y2 = regression.slope * x2 + regression.intercept;
            
            const screenX1 = origin.x + (x1 - (actualXMin + actualXMax) / 2) * xScale;
            const screenY1 = origin.y - (y1 - (actualYMin + actualYMax) / 2) * yScale;
            const screenX2 = origin.x + (x2 - (actualXMin + actualXMax) / 2) * xScale;
            const screenY2 = origin.y - (y2 - (actualYMin + actualYMax) / 2) * yScale;
            
            ctx.moveTo(screenX1, screenY1);
            ctx.lineTo(screenX2, screenY2);
            ctx.stroke();
        }
        
        return {
            canvas: canvas,
            data: data,
            regression: showRegression ? this.calculateLinearRegression(data) : null
        };
    }
    
    /**
     * Calcula regresión lineal
     * @param {Array<Object>} data - Array de puntos {x, y}
     * @returns {Object} Coeficientes de regresión
     */
    static calculateLinearRegression(data) {
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const r = this.calculateCorrelation(data);
        
        return { slope, intercept, r };
    }
    
    /**
     * Calcula coeficiente de correlación
     * @param {Array<Object>} data - Array de puntos {x, y}
     * @returns {number} Coeficiente de correlación
     */
    static calculateCorrelation(data) {
        const n = data.length;
        const meanX = data.reduce((sum, point) => sum + point.x, 0) / n;
        const meanY = data.reduce((sum, point) => sum + point.y, 0) / n;
        
        let numerator = 0;
        let sumSqX = 0;
        let sumSqY = 0;
        
        for (const point of data) {
            const dx = point.x - meanX;
            const dy = point.y - meanY;
            numerator += dx * dy;
            sumSqX += dx * dx;
            sumSqY += dy * dy;
        }
        
        return numerator / Math.sqrt(sumSqX * sumSqY);
    }
    
    /**
     * Visualiza gráfico de barras
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<Object>} data - Array de datos {label, value}
     * @param {Object} options - Opciones de visualización
     */
    static plotBarChart(canvas, data, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
            showValues = true,
            orientation = 'vertical'
        } = options;
        
        canvas.width = 400;
        canvas.height = 300;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const margin = 40;
        const chartWidth = canvas.width - 2 * margin;
        const chartHeight = canvas.height - 2 * margin;
        
        const maxValue = Math.max(...data.map(item => item.value));
        const barWidth = orientation === 'vertical' ? 
            chartWidth / data.length * 0.8 : 
            chartHeight / data.length * 0.8;
        const spacing = orientation === 'vertical' ? 
            chartWidth / data.length * 0.2 : 
            chartHeight / data.length * 0.2;
        
        // Dibujar barras
        data.forEach((item, index) => {
            const color = colors[index % colors.length];
            const normalizedValue = item.value / maxValue;
            
            if (orientation === 'vertical') {
                const barHeight = normalizedValue * chartHeight;
                const x = margin + index * (barWidth + spacing) + spacing / 2;
                const y = canvas.height - margin - barHeight;
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, barWidth, barHeight);
                
                // Etiquetas
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.label, x + barWidth / 2, canvas.height - margin + 20);
                
                if (showValues) {
                    ctx.fillText(item.value.toFixed(1), x + barWidth / 2, y - 5);
                }
            } else {
                const barWidth2 = normalizedValue * chartWidth;
                const x = margin;
                const y = margin + index * (barWidth + spacing) + spacing / 2;
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, barWidth2, barWidth);
                
                // Etiquetas
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(item.label, margin - 10, y + barWidth / 2 + 5);
                
                if (showValues) {
                    ctx.textAlign = 'left';
                    ctx.fillText(item.value.toFixed(1), x + barWidth2 + 10, y + barWidth / 2 + 5);
                }
            }
        });
        
        return {
            canvas: canvas,
            data: data,
            maxValue: maxValue
        };
    }
}
