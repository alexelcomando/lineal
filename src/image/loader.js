/**
 * Módulo de Carga y Guardado de Imágenes
 * Implementación de operaciones para cargar, procesar y guardar imágenes
 * usando Canvas API y operaciones matriciales
 */

import { MatrixOperations } from '../algebra/matrices.js';

export class ImageLoader {
    /**
     * Carga una imagen desde un archivo
     * @param {File} file - Archivo de imagen
     * @returns {Promise<Object>} Objeto con datos de imagen y matrices
     */
    static async loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const imageData = this.processImage(img);
                    resolve({
                        file: file,
                        image: img,
                        imageData: imageData.imageData,
                        matrices: imageData.matrices,
                        width: img.width,
                        height: img.height,
                        originalSrc: event.target.result
                    });
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Carga una imagen desde una URL
     * @param {string} url - URL de la imagen
     * @returns {Promise<Object>} Objeto con datos de imagen y matrices
     */
    static async loadImageFromURL(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Para CORS
            
            img.onload = () => {
                const imageData = this.processImage(img);
                resolve({
                    url: url,
                    image: img,
                    imageData: imageData.imageData,
                    matrices: imageData.matrices,
                    width: img.width,
                    height: img.height
                });
            };
            
            img.onerror = reject;
            img.src = url;
        });
    }
    
    /**
     * Procesa una imagen y extrae sus datos matriciales
     * @param {HTMLImageElement} img - Elemento de imagen
     * @returns {Object} Datos de imagen y matrices
     */
    static processImage(img) {
        // Crear canvas temporal
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Ajustar tamaño del canvas
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar imagen en el canvas
        ctx.drawImage(img, 0, 0);
        
        // Obtener ImageData
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        // Convertir a matrices
        const matrices = this.imageDataToMatrices(imageData);
        
        return {
            imageData: imageData,
            matrices: matrices
        };
    }
    
    /**
     * Convierte ImageData a matrices separadas por canal
     * @param {ImageData} imageData - Datos de imagen del canvas
     * @returns {Object} Matrices por canal
     */
    static imageDataToMatrices(imageData) {
        const redMatrix = MatrixOperations.imageToMatrix(imageData, 'red');
        const greenMatrix = MatrixOperations.imageToMatrix(imageData, 'green');
        const blueMatrix = MatrixOperations.imageToMatrix(imageData, 'blue');
        const alphaMatrix = MatrixOperations.imageToMatrix(imageData, 'alpha');
        const grayscaleMatrix = MatrixOperations.imageToMatrix(imageData, 'grayscale');
        
        return {
            red: redMatrix,
            green: greenMatrix,
            blue: blueMatrix,
            alpha: alphaMatrix,
            grayscale: grayscaleMatrix,
            original: imageData
        };
    }
    
    /**
     * Convierte matrices de vuelta a ImageData
     * @param {Object} matrices - Matrices por canal
     * @param {number} width - Ancho de la imagen
     * @param {number} height - Alto de la imagen
     * @param {string} mode - Modo: 'color', 'grayscale'
     * @returns {ImageData} ImageData reconstruido
     */
    static matricesToImageData(matrices, width, height, mode = 'color') {
        if (mode === 'grayscale') {
            return MatrixOperations.matrixToImage(matrices.grayscale, width, height, 'grayscale');
        } else {
            // Combinar canales RGB
            const imageData = new ImageData(width, height);
            const { data } = imageData;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    
                    data[index] = Math.min(255, Math.max(0, Math.round(matrices.red.get(y, x))));
                    data[index + 1] = Math.min(255, Math.max(0, Math.round(matrices.green.get(y, x))));
                    data[index + 2] = Math.min(255, Math.max(0, Math.round(matrices.blue.get(y, x))));
                    data[index + 3] = Math.min(255, Math.max(0, Math.round(matrices.alpha.get(y, x))));
                }
            }
            
            return imageData;
        }
    }
    
    /**
     * Dibuja ImageData en un canvas
     * @param {ImageData} imageData - Datos de imagen
     * @param {HTMLCanvasElement} canvas - Canvas destino
     * @param {number} x - Posición X (default: 0)
     * @param {number} y - Posición Y (default: 0)
     */
    static drawImageDataToCanvas(imageData, canvas, x = 0, y = 0) {
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, x, y);
    }
    
    /**
     * Redimensiona una imagen manteniendo la relación de aspecto
     * @param {HTMLImageElement} img - Imagen original
     * @param {number} maxWidth - Ancho máximo
     * @param {number} maxHeight - Alto máximo
     * @returns {Object} Imagen redimensionada y nuevas dimensiones
     */
    static resizeImage(img, maxWidth, maxHeight) {
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo relación de aspecto
        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
                width = maxWidth;
                height = maxWidth / aspectRatio;
            } else {
                height = maxHeight;
                width = maxHeight * aspectRatio;
            }
        }
        
        // Crear canvas redimensionado
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a imagen
        const resizedImg = new Image();
        resizedImg.src = canvas.toDataURL();
        
        return {
            image: resizedImg,
            width: width,
            height: height,
            canvas: canvas
        };
    }
    
    /**
     * Crea una imagen de ejemplo para demostración
     * @param {number} width - Ancho de la imagen
     * @param {number} height - Alto de la imagen
     * @param {string} pattern - Patrón: 'gradient', 'checkerboard', 'circles', 'noise'
     * @returns {ImageData} Imagen de ejemplo
     */
    static createSampleImage(width = 400, height = 400, pattern = 'gradient') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        switch (pattern) {
            case 'gradient':
                this.createGradientPattern(ctx, width, height);
                break;
            case 'checkerboard':
                this.createCheckerboardPattern(ctx, width, height);
                break;
            case 'circles':
                this.createCirclesPattern(ctx, width, height);
                break;
            case 'noise':
                this.createNoisePattern(ctx, width, height);
                break;
            default:
                this.createGradientPattern(ctx, width, height);
        }
        
        return ctx.getImageData(0, 0, width, height);
    }
    
    /**
     * Crea un patrón de gradiente
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} width - Ancho
     * @param {number} height - Alto
     */
    static createGradientPattern(ctx, width, height) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.25, '#4ECDC4');
        gradient.addColorStop(0.5, '#45B7D1');
        gradient.addColorStop(0.75, '#96CEB4');
        gradient.addColorStop(1, '#FFEAA7');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    /**
     * Crea un patrón de tablero de ajedrez
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} width - Ancho
     * @param {number} height - Alto
     */
    static createCheckerboardPattern(ctx, width, height) {
        const squareSize = 20;
        
        for (let y = 0; y < height; y += squareSize) {
            for (let x = 0; x < width; x += squareSize) {
                ctx.fillStyle = ((x / squareSize + y / squareSize) % 2 === 0) ? '#2C3E50' : '#ECF0F1';
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }
    
    /**
     * Crea un patrón de círculos
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} width - Ancho
     * @param {number} height - Alto
     */
    static createCirclesPattern(ctx, width, height) {
        ctx.fillStyle = '#34495E';
        ctx.fillRect(0, 0, width, height);
        
        const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];
        const circleCount = 15;
        
        for (let i = 0; i < circleCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 30 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
    
    /**
     * Crea un patrón de ruido
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} width - Ancho
     * @param {number} height - Alto
     */
    static createNoisePattern(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const { data } = imageData;
        
        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;
            data[i] = value;     // Red
            data[i + 1] = value; // Green
            data[i + 2] = value; // Blue
            data[i + 3] = 255;   // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Guarda una imagen como archivo
     * @param {HTMLCanvasElement} canvas - Canvas con la imagen
     * @param {string} filename - Nombre del archivo
     * @param {string} format - Formato: 'png', 'jpeg', 'webp'
     * @param {number} quality - Calidad (0-1, solo para JPEG/WebP)
     */
    static saveImage(canvas, filename, format = 'png', quality = 0.9) {
        const mimeType = format === 'png' ? 'image/png' : 
                       format === 'jpeg' ? 'image/jpeg' : 
                       'image/webp';
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, mimeType, quality);
    }
    
    /**
     * Exporta matrices a formato JSON
     * @param {Object} matrices - Matrices a exportar
     * @param {string} filename - Nombre del archivo
     */
    static exportMatricesToJSON(matrices, filename) {
        const exportData = {
            timestamp: new Date().toISOString(),
            dimensions: {
                width: matrices.red.columns,
                height: matrices.red.rows
            },
            matrices: {
                red: matrices.red.to2DArray(),
                green: matrices.green.to2DArray(),
                blue: matrices.blue.to2DArray(),
                alpha: matrices.alpha.to2DArray(),
                grayscale: matrices.grayscale.to2DArray()
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_matrices.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Importa matrices desde formato JSON
     * @param {File} file - Archivo JSON
     * @returns {Promise<Object>} Matrices importadas
     */
    static async importMatricesFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Reconstruir matrices
                    const matrices = {
                        red: new Matrix(data.matrices.red),
                        green: new Matrix(data.matrices.green),
                        blue: new Matrix(data.matrices.blue),
                        alpha: new Matrix(data.matrices.alpha),
                        grayscale: new Matrix(data.matrices.grayscale)
                    };
                    
                    resolve({
                        matrices: matrices,
                        dimensions: data.dimensions,
                        timestamp: data.timestamp
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    /**
     * Obtiene información estadística de una imagen
     * @param {Object} matrices - Matrices de la imagen
     * @returns {Object} Estadísticas
     */
    static getImageStatistics(matrices) {
        const stats = {
            red: this.getChannelStatistics(matrices.red),
            green: this.getChannelStatistics(matrices.green),
            blue: this.getChannelStatistics(matrices.blue),
            grayscale: this.getChannelStatistics(matrices.grayscale)
        };
        
        return stats;
    }
    
    /**
     * Obtiene estadísticas de un canal
     * @param {Matrix} matrix - Matriz del canal
     * @returns {Object} Estadísticas del canal
     */
    static getChannelStatistics(matrix) {
        const data = matrix.to1DArray();
        
        return {
            min: Math.min(...data),
            max: Math.max(...data),
            mean: data.reduce((sum, val) => sum + val, 0) / data.length,
            median: this.calculateMedian(data),
            standardDeviation: this.calculateStandardDeviation(data),
            histogram: this.calculateHistogram(data)
        };
    }
    
    /**
     * Calcula la mediana
     * @param {Array<number>} data - Datos
     * @returns {number} Mediana
     */
    static calculateMedian(data) {
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? 
            (sorted[mid - 1] + sorted[mid]) / 2 : 
            sorted[mid];
    }
    
    /**
     * Calcula la desviación estándar
     * @param {Array<number>} data - Datos
     * @returns {number} Desviación estándar
     */
    static calculateStandardDeviation(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    }
    
    /**
     * Calcula un histograma
     * @param {Array<number>} data - Datos
     * @param {number} bins - Número de bins (default: 256)
     * @returns {Array<number>} Histograma
     */
    static calculateHistogram(data, bins = 256) {
        const histogram = new Array(bins).fill(0);
        
        for (const value of data) {
            const bin = Math.min(Math.max(0, Math.floor(value)), bins - 1);
            histogram[bin]++;
        }
        
        return histogram;
    }
}
