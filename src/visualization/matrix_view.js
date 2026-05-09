/**
 * Módulo de Visualización de Matrices
 * Implementación de visualizaciones interactivas para matrices y transformaciones
 */

import { MatrixOperations } from '../algebra/matrices.js';
import { VectorOperations } from '../algebra/vectors.js';

export class MatrixVisualization {
    /**
     * Visualiza una matriz en un canvas con colores
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Matrix} matrix - Matriz a visualizar
     * @param {Object} options - Opciones de visualización
     */
    static visualizeMatrix(canvas, matrix, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            cellSize = 10,
            showValues = false,
            colorMap = 'viridis',
            maxValue = null,
            minValue = null
        } = options;
        
        // Configurar tamaño del canvas
        canvas.width = matrix.columns * cellSize;
        canvas.height = matrix.rows * cellSize;
        
        // Determinar rango de valores
        const actualMax = maxValue !== null ? maxValue : matrix.max();
        const actualMin = minValue !== null ? minValue : matrix.min();
        const range = actualMax - actualMin;
        
        // Función de mapeo de color
        const colorFunction = this.getColorMapFunction(colorMap);
        
        // Dibujar matriz
        for (let y = 0; y < matrix.rows; y++) {
            for (let x = 0; x < matrix.columns; x++) {
                const value = matrix.get(y, x);
                const normalizedValue = range > 0 ? (value - actualMin) / range : 0;
                const color = colorFunction(normalizedValue);
                
                ctx.fillStyle = color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                
                // Dibujar valores si es necesario
                if (showValues && cellSize >= 20) {
                    ctx.fillStyle = this.getContrastColor(color);
                    ctx.font = `${Math.min(cellSize / 3, 12)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        value.toFixed(0),
                        x * cellSize + cellSize / 2,
                        y * cellSize + cellSize / 2
                    );
                }
            }
        }
        
        // Dibujar grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= matrix.rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
        
        for (let i = 0; i <= matrix.columns; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
        }
        
        return {
            canvas: canvas,
            matrix: matrix,
            range: { min: actualMin, max: actualMax },
            colorMap: colorMap
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
            },
            grayscale: (t) => {
                const gray = Math.floor(t * 255);
                return `rgb(${gray}, ${gray}, ${gray})`;
            }
        };
        
        return colorMaps[colorMap] || colorMaps.grayscale;
    }
    
    /**
     * Obtiene color de contraste para texto
     * @param {string} color - Color de fondo
     * @returns {string} Color de texto (blanco o negro)
     */
    static getContrastColor(color) {
        // Extraer valores RGB
        const match = color.match(/\d+/g);
        if (!match) return '#000000';
        
        const [r, g, b] = match.map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    /**
     * Visualiza una transformación lineal
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @param {Object} options - Opciones de visualización
     */
    static visualizeTransformation(canvas, transformMatrix, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            gridSize = 20,
            showVectors = true,
            showGrid = true,
            animate = false,
            duration = 2000
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        
        // Centro del canvas
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar ejes
        this.drawAxes(ctx, centerX, centerY);
        
        if (showGrid) {
            // Dibujar grid original y transformado
            this.drawTransformedGrid(ctx, transformMatrix, centerX, centerY, gridSize);
        }
        
        if (showVectors) {
            // Dibujar vectores base
            this.drawBaseVectors(ctx, transformMatrix, centerX, centerY);
        }
        
        return {
            canvas: canvas,
            transformMatrix: transformMatrix,
            gridSize: gridSize
        };
    }
    
    /**
     * Dibuja ejes coordenados
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} centerX - Centro X
     * @param {number} centerY - Centro Y
     */
    static drawAxes(ctx, centerX, centerY) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(ctx.canvas.width, centerY);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, ctx.canvas.height);
        ctx.stroke();
        
        // Etiquetas
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X', ctx.canvas.width - 20, centerY - 10);
        ctx.fillText('Y', centerX + 20, 20);
    }
    
    /**
     * Dibuja grid transformado
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @param {number} centerX - Centro X
     * @param {number} centerY - Centro Y
     * @param {number} gridSize - Tamaño de la cuadrícula
     */
    static drawTransformedGrid(ctx, transformMatrix, centerX, centerY, gridSize) {
        // Grid original (gris claro)
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        
        // Líneas verticales originales
        for (let x = -centerX; x <= centerX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(centerX + x, 0);
            ctx.lineTo(centerX + x, ctx.canvas.height);
            ctx.stroke();
        }
        
        // Líneas horizontales originales
        for (let y = -centerY; y <= centerY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, centerY + y);
            ctx.lineTo(ctx.canvas.width, centerY + y);
            ctx.stroke();
        }
        
        // Grid transformado (azul)
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
        ctx.lineWidth = 2;
        
        // Transformar y dibujar líneas verticales
        for (let x = -centerX; x <= centerX; x += gridSize) {
            const topPoint = VectorOperations.createVector3D(x, -centerY, 1);
            const bottomPoint = VectorOperations.createVector3D(x, centerY, 1);
            
            const transformedTop = this.transformPoint(topPoint, transformMatrix);
            const transformedBottom = this.transformPoint(bottomPoint, transformMatrix);
            
            ctx.beginPath();
            ctx.moveTo(centerX + transformedTop[0], centerY - transformedTop[1]);
            ctx.lineTo(centerX + transformedBottom[0], centerY - transformedBottom[1]);
            ctx.stroke();
        }
        
        // Transformar y dibujar líneas horizontales
        for (let y = -centerY; y <= centerY; y += gridSize) {
            const leftPoint = VectorOperations.createVector3D(-centerX, y, 1);
            const rightPoint = VectorOperations.createVector3D(centerX, y, 1);
            
            const transformedLeft = this.transformPoint(leftPoint, transformMatrix);
            const transformedRight = this.transformPoint(rightPoint, transformMatrix);
            
            ctx.beginPath();
            ctx.moveTo(centerX + transformedLeft[0], centerY - transformedLeft[1]);
            ctx.lineTo(centerX + transformedRight[0], centerY - transformedRight[1]);
            ctx.stroke();
        }
    }
    
    /**
     * Transforma un punto usando la matriz de transformación
     * @param {Array} point - Punto 3D [x, y, w]
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @returns {Array} Punto transformado
     */
    static transformPoint(point, transformMatrix) {
        if (transformMatrix.rows === 2 && transformMatrix.columns === 2) {
            // Transformación 2D
            return VectorOperations.createVector3D(
                ...VectorOperations.transformPoint2D([point[0], point[1]], transformMatrix),
                1
            );
        } else if (transformMatrix.rows === 3 && transformMatrix.columns === 3) {
            // Transformación 3D (coordenadas homogéneas)
            const transformed = VectorOperations.createVector3D(
                transformMatrix.get(0, 0) * point[0] + transformMatrix.get(0, 1) * point[1] + transformMatrix.get(0, 2) * point[2],
                transformMatrix.get(1, 0) * point[0] + transformMatrix.get(1, 1) * point[1] + transformMatrix.get(1, 2) * point[2],
                transformMatrix.get(2, 0) * point[0] + transformMatrix.get(2, 1) * point[1] + transformMatrix.get(2, 2) * point[2]
            );
            
            // Normalizar coordenadas homogéneas
            if (transformed[2] !== 0) {
                return [transformed[0] / transformed[2], transformed[1] / transformed[2], 1];
            }
            
            return transformed;
        }
        
        return point;
    }
    
    /**
     * Dibuja vectores base
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @param {number} centerX - Centro X
     * @param {number} centerY - Centro Y
     */
    static drawBaseVectors(ctx, transformMatrix, centerX, centerY) {
        const vectorLength = 50;
        
        // Vector base i (rojo)
        const iOriginal = VectorOperations.createVector3D(vectorLength, 0, 1);
        const iTransformed = this.transformPoint(iOriginal, transformMatrix);
        
        // Vector base j (verde)
        const jOriginal = VectorOperations.createVector3D(0, vectorLength, 1);
        const jTransformed = this.transformPoint(jOriginal, transformMatrix);
        
        // Dibujar vectores originales (translúcidos)
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.lineWidth = 3;
        this.drawArrow(ctx, centerX, centerY, centerX + iOriginal[0], centerY - iOriginal[0]);
        
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
        this.drawArrow(ctx, centerX, centerY, centerX + jOriginal[0], centerY - jOriginal[0]);
        
        // Dibujar vectores transformados (sólidos)
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 4;
        this.drawArrow(ctx, centerX, centerY, centerX + iTransformed[0], centerY - iTransformed[1]);
        
        ctx.strokeStyle = '#2ecc71';
        this.drawArrow(ctx, centerX, centerY, centerX + jTransformed[0], centerY - jTransformed[1]);
        
        // Etiquetas
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('i\'', centerX + iTransformed[0] + 10, centerY - iTransformed[1] - 10);
        
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('j\'', centerX + jTransformed[0] + 10, centerY - jTransformed[1] - 10);
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
        
        // Línea principal
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Cabeza de flecha
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
    
    /**
     * Visualiza histograma de valores de matriz
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Matrix} matrix - Matriz a analizar
     * @param {Object} options - Opciones de visualización
     */
    static visualizeHistogram(canvas, matrix, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            bins = 256,
            color = '#3498db',
            showStats = true
        } = options;
        
        canvas.width = 400;
        canvas.height = 300;
        
        // Calcular histograma
        const data = matrix.to1DArray();
        const histogram = this.calculateHistogram(data, bins);
        const maxCount = Math.max(...histogram);
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar histograma
        const barWidth = canvas.width / bins;
        const scale = (canvas.height - 40) / maxCount;
        
        ctx.fillStyle = color;
        
        for (let i = 0; i < bins; i++) {
            const barHeight = histogram[i] * scale;
            ctx.fillRect(i * barWidth, canvas.height - barHeight - 20, barWidth - 1, barHeight);
        }
        
        // Dibujar ejes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width, canvas.height - 20);
        ctx.stroke();
        
        // Mostrar estadísticas
        if (showStats) {
            const stats = this.calculateStatistics(data);
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            
            ctx.fillText(`Min: ${stats.min.toFixed(2)}`, 10, 20);
            ctx.fillText(`Max: ${stats.max.toFixed(2)}`, 10, 35);
            ctx.fillText(`Mean: ${stats.mean.toFixed(2)}`, 100, 20);
            ctx.fillText(`Std: ${stats.std.toFixed(2)}`, 100, 35);
        }
        
        return {
            canvas: canvas,
            histogram: histogram,
            bins: bins,
            statistics: this.calculateStatistics(data)
        };
    }
    
    /**
     * Calcula histograma de datos
     * @param {Array<number>} data - Datos
     * @param {number} bins - Número de bins
     * @returns {Array<number>} Histograma
     */
    static calculateHistogram(data, bins) {
        const histogram = new Array(bins).fill(0);
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        for (const value of data) {
            const bin = Math.min(Math.floor(((value - min) / range) * bins), bins - 1);
            histogram[bin]++;
        }
        
        return histogram;
    }
    
    /**
     * Calcula estadísticas básicas
     * @param {Array<number>} data - Datos
     * @returns {Object} Estadísticas
     */
    static calculateStatistics(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const std = Math.sqrt(variance);
        
        return {
            min: Math.min(...data),
            max: Math.max(...data),
            mean: mean,
            std: std,
            count: data.length
        };
    }
    
    /**
     * Visualiza valores singulares (para SVD)
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<number>} singularValues - Valores singulares
     * @param {Object} options - Opciones de visualización
     */
    static visualizeSingularValues(canvas, singularValues, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            color = '#9b59b6',
            showCumulative = true,
            logScale = false
        } = options;
        
        canvas.width = 400;
        canvas.height = 300;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Preparar datos
        const maxValue = Math.max(...singularValues);
        const barWidth = canvas.width / singularValues.length;
        const scale = (canvas.height - 60) / (logScale ? Math.log10(maxValue) : maxValue);
        
        // Dibujar valores singulares
        ctx.fillStyle = color;
        
        for (let i = 0; i < singularValues.length; i++) {
            const value = singularValues[i];
            const barHeight = (logScale ? Math.log10(value) : value) * scale;
            ctx.fillRect(i * barWidth, canvas.height - barHeight - 40, barWidth - 2, barHeight);
        }
        
        // Dibujar suma acumulativa
        if (showCumulative) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            let cumulative = 0;
            for (let i = 0; i < singularValues.length; i++) {
                cumulative += singularValues[i];
                const x = i * barWidth + barWidth / 2;
                const y = canvas.height - (cumulative / singularValues.reduce((a, b) => a + b, 0)) * (canvas.height - 60) - 40;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Etiquetas
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Índice de Valor Singular', canvas.width / 2, canvas.height - 5);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Valor Singular', 0, 0);
        ctx.restore();
        
        return {
            canvas: canvas,
            singularValues: singularValues,
            cumulativeEnergy: this.calculateCumulativeEnergy(singularValues)
        };
    }
    
    /**
     * Calcula energía acumulada de valores singulares
     * @param {Array<number>} singularValues - Valores singulares
     * @returns {Array<number>} Energía acumulada normalizada
     */
    static calculateCumulativeEnergy(singularValues) {
        const totalEnergy = singularValues.reduce((sum, val) => sum + val * val, 0);
        const cumulative = [];
        let accumulated = 0;
        
        for (const value of singularValues) {
            accumulated += value * value;
            cumulative.push(accumulated / totalEnergy);
        }
        
        return cumulative;
    }
    
    /**
     * Crea una visualización interactiva de matriz con tooltips
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Matrix} matrix - Matriz a visualizar
     * @param {Function} onCellClick - Callback al hacer clic en celda
     */
    static createInteractiveMatrix(canvas, matrix, onCellClick) {
        const cellSize = 20;
        canvas.width = matrix.columns * cellSize;
        canvas.height = matrix.rows * cellSize;
        
        const ctx = canvas.getContext('2d');
        
        // Visualización inicial
        this.visualizeMatrix(canvas, matrix, { cellSize, showValues: true });
        
        // Event listeners
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / cellSize);
            const y = Math.floor((event.clientY - rect.top) / cellSize);
            
            if (x >= 0 && x < matrix.columns && y >= 0 && y < matrix.rows) {
                const value = matrix.get(y, x);
                onCellClick({ x, y, value });
            }
        });
        
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / cellSize);
            const y = Math.floor((event.clientY - rect.top) / cellSize);
            
            if (x >= 0 && x < matrix.columns && y >= 0 && y < matrix.rows) {
                canvas.style.cursor = 'pointer';
                canvas.title = `Posición: [${y}, ${x}]\nValor: ${matrix.get(y, x).toFixed(2)}`;
            } else {
                canvas.style.cursor = 'default';
                canvas.title = '';
            }
        });
        
        return {
            canvas: canvas,
            matrix: matrix,
            cellSize: cellSize
        };
    }
}
