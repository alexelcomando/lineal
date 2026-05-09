/**
 * Módulo de Convoluciones y Kernels
 * Implementación de operaciones de convolución para filtros matemáticos
 * y procesamiento de imágenes usando álgebra lineal
 */

import { Matrix } from 'ml-matrix';
import { MatrixOperations } from './matrices.js';

export class ConvolutionOperations {
    /**
     * Kernels de convolución predefinidos
     */
    static KERNELS = {
        // Kernel de Blur (Gaussiano 3x3)
        blur: [
            [1/16, 2/16, 1/16],
            [2/16, 4/16, 2/16],
            [1/16, 2/16, 1/16]
        ],
        
        // Kernel de Sharpen
        sharpen: [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ],
        
        // Kernel de Edge Detection (Sobel Horizontal)
        edgeHorizontal: [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ],
        
        // Kernel de Edge Detection (Sobel Vertical)
        edgeVertical: [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ],
        
        // Kernel de Edge Detection (Laplaciano)
        laplacian: [
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0]
        ],
        
        // Kernel de Emboss
        emboss: [
            [-2, -1, 0],
            [-1, 1, 1],
            [0, 1, 2]
        ],
        
        // Kernel de Identidad
        identity: [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
        ],
        
        // Kernel de Detección de Bordes (Prewitt Horizontal)
        prewittHorizontal: [
            [-1, 0, 1],
            [-1, 0, 1],
            [-1, 0, 1]
        ],
        
        // Kernel de Detección de Bordes (Prewitt Vertical)
        prewittVertical: [
            [-1, -1, -1],
            [0, 0, 0],
            [1, 1, 1]
        ],
        
        // Kernel de Gaussian Blur 5x5
        gaussian5x5: [
            [1/256, 4/256, 6/256, 4/256, 1/256],
            [4/256, 16/256, 24/256, 16/256, 4/256],
            [6/256, 24/256, 36/256, 24/256, 6/256],
            [4/256, 16/256, 24/256, 16/256, 4/256],
            [1/256, 4/256, 6/256, 4/256, 1/256]
        ]
    };
    
    /**
     * Aplica convolución a una matriz de imagen
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {Array<Array<number>>} kernel - Kernel de convolución
     * @param {string} padding - Tipo de padding: 'zero', 'replicate', 'reflect'
     * @returns {Matrix} Matriz resultante
     */
    static convolve(imageMatrix, kernel, padding = 'zero') {
        const kernelMatrix = new Matrix(kernel);
        const kernelSize = kernelMatrix.rows;
        const kernelCenter = Math.floor(kernelSize / 2);
        
        // Aplicar padding a la imagen
        const paddedMatrix = this.applyPadding(imageMatrix, kernelCenter, padding);
        
        // Crear matriz de resultado
        const resultMatrix = new Matrix(imageMatrix.rows, imageMatrix.columns);
        
        // Aplicar convolución
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                let sum = 0;
                
                // Aplicar kernel
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const imageY = y + ky;
                        const imageX = x + kx;
                        const imageValue = paddedMatrix.get(imageY, imageX);
                        const kernelValue = kernelMatrix.get(kernelSize - 1 - ky, kernelSize - 1 - kx);
                        sum += imageValue * kernelValue;
                    }
                }
                
                resultMatrix.set(y, x, sum);
            }
        }
        
        return resultMatrix;
    }
    
    /**
     * Aplica padding a una matriz
     * @param {Matrix} matrix - Matriz original
     * @param {number} paddingSize - Tamaño del padding
     * @param {string} type - Tipo de padding
     * @returns {Matrix} Matriz con padding
     */
    static applyPadding(matrix, paddingSize, type = 'zero') {
        const newRows = matrix.rows + 2 * paddingSize;
        const newCols = matrix.columns + 2 * paddingSize;
        const paddedMatrix = new Matrix(newRows, newCols);
        
        // Inicializar con ceros
        paddedMatrix.fill(0);
        
        // Copiar matriz original
        for (let y = 0; y < matrix.rows; y++) {
            for (let x = 0; x < matrix.columns; x++) {
                paddedMatrix.set(y + paddingSize, x + paddingSize, matrix.get(y, x));
            }
        }
        
        // Aplicar diferentes tipos de padding
        switch (type) {
            case 'replicate':
                this.applyReplicatePadding(paddedMatrix, matrix, paddingSize);
                break;
            case 'reflect':
                this.applyReflectPadding(paddedMatrix, matrix, paddingSize);
                break;
            case 'zero':
            default:
                // Ya está inicializado con ceros
                break;
        }
        
        return paddedMatrix;
    }
    
    /**
     * Aplica padding de replicación
     * @param {Matrix} paddedMatrix - Matriz con padding
     * @param {Matrix} originalMatrix - Matriz original
     * @param {number} paddingSize - Tamaño del padding
     */
    static applyReplicatePadding(paddedMatrix, originalMatrix, paddingSize) {
        const rows = originalMatrix.rows;
        const cols = originalMatrix.columns;
        
        // Bordes superior e inferior
        for (let x = 0; x < cols; x++) {
            for (let p = 0; p < paddingSize; p++) {
                // Borde superior
                paddedMatrix.set(p, x + paddingSize, originalMatrix.get(0, x));
                // Borde inferior
                paddedMatrix.set(rows + paddingSize + p, x + paddingSize, originalMatrix.get(rows - 1, x));
            }
        }
        
        // Bordes izquierdo y derecho
        for (let y = 0; y < rows + 2 * paddingSize; y++) {
            for (let p = 0; p < paddingSize; p++) {
                // Borde izquierdo
                const leftValue = y < paddingSize ? 0 : 
                                 y >= rows + paddingSize ? originalMatrix.get(rows - 1, 0) :
                                 originalMatrix.get(y - paddingSize, 0);
                paddedMatrix.set(y, p, leftValue);
                
                // Borde derecho
                const rightValue = y < paddingSize ? 0 :
                                  y >= rows + paddingSize ? originalMatrix.get(rows - 1, cols - 1) :
                                  originalMatrix.get(y - paddingSize, cols - 1);
                paddedMatrix.set(y, cols + paddingSize + p, rightValue);
            }
        }
        
        // Esquinas
        for (let py = 0; py < paddingSize; py++) {
            for (let px = 0; px < paddingSize; px++) {
                // Esquina superior izquierda
                paddedMatrix.set(py, px, originalMatrix.get(0, 0));
                // Esquina superior derecha
                paddedMatrix.set(py, cols + paddingSize + px, originalMatrix.get(0, cols - 1));
                // Esquina inferior izquierda
                paddedMatrix.set(rows + paddingSize + py, px, originalMatrix.get(rows - 1, 0));
                // Esquina inferior derecha
                paddedMatrix.set(rows + paddingSize + py, cols + paddingSize + px, originalMatrix.get(rows - 1, cols - 1));
            }
        }
    }
    
    /**
     * Aplica padding de reflexión
     * @param {Matrix} paddedMatrix - Matriz con padding
     * @param {Matrix} originalMatrix - Matriz original
     * @param {number} paddingSize - Tamaño del padding
     */
    static applyReflectPadding(paddedMatrix, originalMatrix, paddingSize) {
        const rows = originalMatrix.rows;
        const cols = originalMatrix.columns;
        
        // Reflexión vertical
        for (let y = 0; y < paddingSize; y++) {
            for (let x = 0; x < cols; x++) {
                // Superior
                paddedMatrix.set(paddingSize - 1 - y, x + paddingSize, originalMatrix.get(y, x));
                // Inferior
                paddedMatrix.set(rows + paddingSize + y, x + paddingSize, originalMatrix.get(rows - 1 - y, x));
            }
        }
        
        // Reflexión horizontal
        for (let y = 0; y < rows + 2 * paddingSize; y++) {
            for (let x = 0; x < paddingSize; x++) {
                const sourceY = Math.max(0, Math.min(rows - 1, y - paddingSize));
                // Izquierdo
                paddedMatrix.set(y, paddingSize - 1 - x, originalMatrix.get(sourceY, x));
                // Derecho
                paddedMatrix.set(y, cols + paddingSize + x, originalMatrix.get(sourceY, cols - 1 - x));
            }
        }
        
        // Esquinas (reflexión diagonal)
        for (let py = 0; py < paddingSize; py++) {
            for (let px = 0; px < paddingSize; px++) {
                // Superior izquierda
                paddedMatrix.set(paddingSize - 1 - py, paddingSize - 1 - px, originalMatrix.get(py, px));
                // Superior derecha
                paddedMatrix.set(paddingSize - 1 - py, cols + paddingSize + px, originalMatrix.get(py, cols - 1 - px));
                // Inferior izquierda
                paddedMatrix.set(rows + paddingSize + py, paddingSize - 1 - px, originalMatrix.get(rows - 1 - py, px));
                // Inferior derecha
                paddedMatrix.set(rows + paddingSize + py, cols + paddingSize + px, originalMatrix.get(rows - 1 - py, cols - 1 - px));
            }
        }
    }
    
    /**
     * Aplica un filtro predefinido
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {string} filterType - Tipo de filtro
     * @param {string} padding - Tipo de padding
     * @returns {Matrix} Matriz filtrada
     */
    static applyFilter(imageMatrix, filterType, padding = 'zero') {
        if (!this.KERNELS[filterType]) {
            throw new Error(`Filtro no encontrado: ${filterType}`);
        }
        
        const kernel = this.KERNELS[filterType];
        let result = this.convolve(imageMatrix, kernel, padding);
        
        // Normalizar resultado si es necesario
        if (filterType === 'sharpen' || filterType === 'emboss') {
            result = MatrixOperations.normalize(result);
        }
        
        // Asegurar que los valores estén en el rango válido
        result = MatrixOperations.elementWiseOperation(result, value => 
            Math.max(0, Math.min(255, value))
        );
        
        return result;
    }
    
    /**
     * Detección de bordes combinada (Sobel)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {string} padding - Tipo de padding
     * @returns {Matrix} Magnitud del gradiente
     */
    static sobelEdgeDetection(imageMatrix, padding = 'zero') {
        // Aplicar kernels Sobel horizontal y vertical
        const gx = this.convolve(imageMatrix, this.KERNELS.edgeHorizontal, padding);
        const gy = this.convolve(imageMatrix, this.KERNELS.edgeVertical, padding);
        
        // Calcular magnitud del gradiente
        const magnitude = new Matrix(imageMatrix.rows, imageMatrix.columns);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                const gxValue = gx.get(y, x);
                const gyValue = gy.get(y, x);
                const gradMagnitude = Math.sqrt(gxValue * gxValue + gyValue * gyValue);
                magnitude.set(y, x, gradMagnitude);
            }
        }
        
        return MatrixOperations.normalize(magnitude);
    }
    
    /**
     * Convierte una imagen a escala de grises
     * @param {Matrix} redMatrix - Canal rojo
     * @param {Matrix} greenMatrix - Canal verde
     * @param {Matrix} blueMatrix - Canal azul
     * @returns {Matrix} Imagen en escala de grises
     */
    static convertToGrayscale(redMatrix, greenMatrix, blueMatrix) {
        const grayscaleMatrix = new Matrix(redMatrix.rows, redMatrix.columns);
        
        for (let y = 0; y < redMatrix.rows; y++) {
            for (let x = 0; x < redMatrix.columns; x++) {
                const r = redMatrix.get(y, x);
                const g = greenMatrix.get(y, x);
                const b = blueMatrix.get(y, x);
                
                // Fórmula estándar de conversión a escala de grises
                const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                grayscaleMatrix.set(y, x, gray);
            }
        }
        
        return grayscaleMatrix;
    }
    
    /**
     * Crea un kernel Gaussiano
     * @param {number} size - Tamaño del kernel (debe ser impar)
     * @param {number} sigma - Desviación estándar
     * @returns {Array<Array<number>>} Kernel Gaussiano
     */
    static createGaussianKernel(size, sigma) {
        if (size % 2 === 0) {
            throw new Error('El tamaño del kernel debe ser impar');
        }
        
        const kernel = [];
        const center = Math.floor(size / 2);
        let sum = 0;
        
        // Calcular valores del kernel
        for (let y = 0; y < size; y++) {
            kernel[y] = [];
            for (let x = 0; x < size; x++) {
                const dx = x - center;
                const dy = y - center;
                const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
                kernel[y][x] = value;
                sum += value;
            }
        }
        
        // Normalizar el kernel
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                kernel[y][x] /= sum;
            }
        }
        
        return kernel;
    }
    
    /**
     * Crea un kernel personalizado
     * @param {number} size - Tamaño del kernel
     * @param {Function} function - Función para generar valores
     * @returns {Array<Array<number>>} Kernel personalizado
     */
    static createCustomKernel(size, valueFunction) {
        const kernel = [];
        const center = Math.floor(size / 2);
        
        for (let y = 0; y < size; y++) {
            kernel[y] = [];
            for (let x = 0; x < size; x++) {
                const dx = x - center;
                const dy = y - center;
                kernel[y][x] = valueFunction(dx, dy, x, y);
            }
        }
        
        return kernel;
    }
    
    /**
     * Aplica convolución separable (optimización para kernels separables)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {Array<number>} horizontalKernel - Kernel horizontal
     * @param {Array<number>} verticalKernel - Kernel vertical
     * @param {string} padding - Tipo de padding
     * @returns {Matrix} Matriz resultante
     */
    static separableConvolution(imageMatrix, horizontalKernel, verticalKernel, padding = 'zero') {
        // Primera convolución (horizontal)
        const horizontalMatrix = [horizontalKernel];
        const intermediate = this.convolve(imageMatrix, horizontalMatrix, padding);
        
        // Segunda convolución (vertical)
        const verticalMatrix = verticalKernel.map(value => [value]);
        const result = this.convolve(intermediate, verticalMatrix, padding);
        
        return result;
    }
    
    /**
     * Verifica si un kernel es separable
     * @param {Array<Array<number>>} kernel - Kernel a verificar
     * @returns {Object} {separable: boolean, horizontal: Array, vertical: Array}
     */
    static isSeparable(kernel) {
        const size = kernel.length;
        
        // Intentar descomposición SVD
        const kernelMatrix = new Matrix(kernel);
        const svd = kernelMatrix.svd();
        
        // Verificar si hay un solo valor singular significativo
        const tolerance = 1e-10;
        const significantSingularValues = svd.S.filter(s => s > tolerance).length;
        
        if (significantSingularValues === 1) {
            // Extraer vectores singulares
            const u = svd.U.column(0);
            const v = svd.V.column(0);
            const sigma = svd.S[0];
            
            const horizontal = u.map(value => value * Math.sqrt(sigma));
            const vertical = v.map(value => value * Math.sqrt(sigma));
            
            return {
                separable: true,
                horizontal: horizontal,
                vertical: vertical
            };
        }
        
        return {
            separable: false,
            horizontal: null,
            vertical: null
        };
    }
    
    /**
     * Genera explicación matemática de la convolución
     * @param {Array<Array<number>>} kernel - Kernel aplicado
     * @param {string} filterType - Tipo de filtro
     * @returns {Object} Explicación detallada
     */
    static explainConvolution(kernel, filterType) {
        const explanation = {
            type: filterType,
            kernel: kernel,
            kernelSize: kernel.length,
            description: '',
            mathematicalOperation: '',
            effect: '',
            formula: ''
        };
        
        switch (filterType) {
            case 'blur':
                explanation.description = 'Filtro de desenfoque (blur) que suaviza la imagen';
                explanation.mathematicalOperation = 'Convolución con kernel Gaussiano';
                explanation.effect = 'Reduce ruido y detalles finos';
                explanation.formula = 'I\'(x,y) = ΣΣ I(x+i,y+j) * G(i,j)';
                break;
                
            case 'sharpen':
                explanation.description = 'Filtro de enfoque que realza bordes';
                explanation.mathematicalOperation = 'Convolución con kernel de sharpening';
                explanation.effect = 'Aumenta el contraste en los bordes';
                explanation.formula = 'I\'(x,y) = I(x,y) + α * ∇²I(x,y)';
                break;
                
            case 'edgeHorizontal':
                explanation.description = 'Detección de bordes horizontales (Sobel)';
                explanation.mathematicalOperation = 'Derivada espacial en dirección X';
                explanation.effect = 'Detecta cambios de intensidad horizontal';
                explanation.formula = 'Gx = I * [-1 0 1; -2 0 2; -1 0 1]';
                break;
                
            case 'edgeVertical':
                explanation.description = 'Detección de bordes verticales (Sobel)';
                explanation.mathematicalOperation = 'Derivada espacial en dirección Y';
                explanation.effect = 'Detecta cambios de intensidad vertical';
                explanation.formula = 'Gy = I * [-1 -2 -1; 0 0 0; 1 2 1]';
                break;
                
            case 'laplacian':
                explanation.description = 'Detección de bordes (Laplaciano)';
                explanation.mathematicalOperation = 'Segunda derivada espacial';
                explanation.effect = 'Detecta cambios de intensidad en todas direcciones';
                explanation.formula = '∇²I = ∂²I/∂x² + ∂²I/∂y²';
                break;
                
            case 'emboss':
                explanation.description = 'Filtro de relieve (emboss)';
                explanation.mathematicalOperation = 'Convolución con kernel asimétrico';
                explanation.effect = 'Crea efecto 3D de relieve';
                explanation.formula = 'I\' = I * kernel de emboss';
                break;
                
            default:
                explanation.description = 'Filtro de convolución personalizado';
                explanation.mathematicalOperation = 'Convolución matricial';
                explanation.effect = 'Aplica transformación espacial';
                explanation.formula = 'I\'(x,y) = ΣΣ I(x+i,y+j) * K(i,j)';
        }
        
        return explanation;
    }
}
