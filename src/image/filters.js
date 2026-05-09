/**
 * Módulo de Filtros Matemáticos
 * Implementación de filtros de imagen usando álgebra lineal y convoluciones
 */

import { MatrixOperations } from '../algebra/matrices.js';
import { ConvolutionOperations } from '../algebra/convolution.js';

export class ImageFilters {
    /**
     * Aplica filtro de desenfoque (blur)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} intensity - Intensidad del desenfoque (1-10)
     * @returns {Matrix} Imagen filtrada
     */
    static applyBlur(imageMatrix, intensity = 3) {
        // Crear kernel Gaussiano según intensidad
        const kernelSize = Math.min(2 * intensity + 1, 11); // Máximo 11x11
        const sigma = intensity / 3;
        const kernel = ConvolutionOperations.createGaussianKernel(kernelSize, sigma);
        
        return ConvolutionOperations.convolve(imageMatrix, kernel, 'replicate');
    }
    
    /**
     * Aplica filtro de enfoque (sharpen)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} strength - Fuerza del enfoque (0.1-2.0)
     * @returns {Matrix} Imagen filtrada
     */
    static applySharpen(imageMatrix, strength = 1.0) {
        // Kernel de sharpen ajustable
        const kernel = [
            [0, -strength, 0],
            [-strength, 1 + 4 * strength, -strength],
            [0, -strength, 0]
        ];
        
        let result = ConvolutionOperations.convolve(imageMatrix, kernel, 'replicate');
        
        // Normalizar y clamping
        result = MatrixOperations.elementWiseOperation(result, value => 
            Math.max(0, Math.min(255, value))
        );
        
        return result;
    }
    
    /**
     * Aplica filtro de detección de bordes (Sobel)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} threshold - Umbral de detección (0-255)
     * @returns {Matrix} Imagen con bordes detectados
     */
    static applyEdgeDetection(imageMatrix, threshold = 50) {
        // Aplicar Sobel
        const edgeMatrix = ConvolutionOperations.sobelEdgeDetection(imageMatrix, 'replicate');
        
        // Aplicar umbral
        const thresholdedMatrix = MatrixOperations.elementWiseOperation(edgeMatrix, value => 
            value > threshold ? 255 : 0
        );
        
        return thresholdedMatrix;
    }
    
    /**
     * Aplica filtro de relieve (emboss)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} strength - Fuerza del relieve (0.1-2.0)
     * @returns {Matrix} Imagen con efecto emboss
     */
    static applyEmboss(imageMatrix, strength = 1.0) {
        // Kernel de emboss ajustable
        const kernel = [
            [-2 * strength, -strength, 0],
            [-strength, strength, strength],
            [0, strength, 2 * strength]
        ];
        
        let result = ConvolutionOperations.convolve(imageMatrix, kernel, 'replicate');
        
        // Normalizar
        result = MatrixOperations.normalize(result);
        
        return result;
    }
    
    /**
     * Convierte imagen a escala de grises
     * @param {Object} matrices - Matrices de canales RGB
     * @returns {Matrix} Imagen en escala de grises
     */
    static applyGrayscale(matrices) {
        return ConvolutionOperations.convertToGrayscale(
            matrices.red, 
            matrices.green, 
            matrices.blue
        );
    }
    
    /**
     * Aplica filtro de brillo
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} brightness - Ajuste de brillo (-255 a 255)
     * @returns {Matrix} Imagen con brillo ajustado
     */
    static applyBrightness(imageMatrix, brightness) {
        return MatrixOperations.elementWiseOperation(imageMatrix, value => 
            Math.max(0, Math.min(255, value + brightness))
        );
    }
    
    /**
     * Aplica filtro de contraste
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} contrast - Factor de contraste (0.1-3.0)
     * @returns {Matrix} Imagen con contraste ajustado
     */
    static applyContrast(imageMatrix, contrast) {
        return MatrixOperations.elementWiseOperation(imageMatrix, value => 
            Math.max(0, Math.min(255, (value - 128) * contrast + 128))
        );
    }
    
    /**
     * Aplica filtro de saturación
     * @param {Object} matrices - Matrices de canales RGB
     * @param {number} saturation - Factor de saturación (0-2)
     * @returns {Object} Matrices con saturación ajustada
     */
    static applySaturation(matrices, saturation) {
        const { red, green, blue } = matrices;
        
        // Convertir a HSV, ajustar saturación, volver a RGB
        const result = {
            red: red.clone(),
            green: green.clone(),
            blue: blue.clone()
        };
        
        for (let y = 0; y < red.rows; y++) {
            for (let x = 0; x < red.columns; x++) {
                const r = red.get(y, x) / 255;
                const g = green.get(y, x) / 255;
                const b = blue.get(y, x) / 255;
                
                // RGB a HSV
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const delta = max - min;
                
                let h, s, v = max;
                
                if (delta === 0) {
                    h = 0;
                    s = 0;
                } else {
                    s = delta / max;
                    
                    if (max === r) {
                        h = ((g - b) / delta) % 6;
                    } else if (max === g) {
                        h = (b - r) / delta + 2;
                    } else {
                        h = (r - g) / delta + 4;
                    }
                    
                    h = h / 6;
                }
                
                // Ajustar saturación
                s = Math.min(1, s * saturation);
                
                // HSV a RGB
                const c = v * s;
                const x = c * (1 - Math.abs((h * 6) % 2 - 1));
                const m = v - c;
                
                let newR, newG, newB;
                
                if (h < 1/6) {
                    newR = c; newG = x; newB = 0;
                } else if (h < 2/6) {
                    newR = x; newG = c; newB = 0;
                } else if (h < 3/6) {
                    newR = 0; newG = c; newB = x;
                } else if (h < 4/6) {
                    newR = 0; newG = x; newB = c;
                } else if (h < 5/6) {
                    newR = x; newG = 0; newB = c;
                } else {
                    newR = c; newG = 0; newB = x;
                }
                
                result.red.set(y, x, (newR + m) * 255);
                result.green.set(y, x, (newG + m) * 255);
                result.blue.set(y, x, (newB + m) * 255);
            }
        }
        
        return result;
    }
    
    /**
     * Aplica filtro de inversión de colores
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @returns {Matrix} Imagen invertida
     */
    static applyInvert(imageMatrix) {
        return MatrixOperations.elementWiseOperation(imageMatrix, value => 255 - value);
    }
    
    /**
     * Aplica filtro de posterización
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} levels - Número de niveles (2-256)
     * @returns {Matrix} Imagen posterizada
     */
    static applyPosterize(imageMatrix, levels = 8) {
        const stepSize = 256 / levels;
        
        return MatrixOperations.elementWiseOperation(imageMatrix, value => 
            Math.floor(value / stepSize) * stepSize
        );
    }
    
    /**
     * Aplica filtro de umbralización (binarización)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} threshold - Umbral (0-255)
     * @returns {Matrix} Imagen binarizada
     */
    static applyThreshold(imageMatrix, threshold = 128) {
        return MatrixOperations.elementWiseOperation(imageMatrix, value => 
            value > threshold ? 255 : 0
        );
    }
    
    /**
     * Aplica filtro de ruido (noise)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} intensity - Intensidad del ruido (0-100)
     * @param {string} type - Tipo: 'gaussian', 'uniform', 'salt_pepper'
     * @returns {Matrix} Imagen con ruido
     */
    static applyNoise(imageMatrix, intensity = 10, type = 'gaussian') {
        const result = imageMatrix.clone();
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                const originalValue = imageMatrix.get(y, x);
                let noisyValue;
                
                switch (type) {
                    case 'gaussian':
                        // Ruido gaussiano
                        const gaussianNoise = this.gaussianRandom() * intensity;
                        noisyValue = originalValue + gaussianNoise;
                        break;
                        
                    case 'uniform':
                        // Ruido uniforme
                        const uniformNoise = (Math.random() - 0.5) * 2 * intensity;
                        noisyValue = originalValue + uniformNoise;
                        break;
                        
                    case 'salt_pepper':
                        // Ruido sal y pimienta
                        if (Math.random() < intensity / 100) {
                            noisyValue = Math.random() < 0.5 ? 0 : 255;
                        } else {
                            noisyValue = originalValue;
                        }
                        break;
                        
                    default:
                        noisyValue = originalValue;
                }
                
                result.set(y, x, Math.max(0, Math.min(255, noisyValue)));
            }
        }
        
        return result;
    }
    
    /**
     * Genera número aleatorio con distribución gaussiana (Box-Muller)
     * @returns {number} Número aleatorio gaussiano
     */
    static gaussianRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    
    /**
     * Aplica filtro de dilatación morfológica
     * @param {Matrix} imageMatrix - Matriz de imagen binaria
     * @param {number} kernelSize - Tamaño del kernel estructural
     * @returns {Matrix} Imagen dilatada
     */
    static applyDilation(imageMatrix, kernelSize = 3) {
        const result = new Matrix(imageMatrix.rows, imageMatrix.columns).fill(0);
        const halfKernel = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                let maxValue = 0;
                
                // Buscar máximo en vecindad
                for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                    for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        
                        if (ny >= 0 && ny < imageMatrix.rows && nx >= 0 && nx < imageMatrix.columns) {
                            maxValue = Math.max(maxValue, imageMatrix.get(ny, nx));
                        }
                    }
                }
                
                result.set(y, x, maxValue);
            }
        }
        
        return result;
    }
    
    /**
     * Aplica filtro de erosión morfológica
     * @param {Matrix} imageMatrix - Matriz de imagen binaria
     * @param {number} kernelSize - Tamaño del kernel estructural
     * @returns {Matrix} Imagen erosionada
     */
    static applyErosion(imageMatrix, kernelSize = 3) {
        const result = new Matrix(imageMatrix.rows, imageMatrix.columns).fill(255);
        const halfKernel = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                let minValue = 255;
                
                // Buscar mínimo en vecindad
                for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                    for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        
                        if (ny >= 0 && ny < imageMatrix.rows && nx >= 0 && nx < imageMatrix.columns) {
                            minValue = Math.min(minValue, imageMatrix.get(ny, nx));
                        }
                    }
                }
                
                result.set(y, x, minValue);
            }
        }
        
        return result;
    }
    
    /**
     * Aplica filtro de mediana
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} kernelSize - Tamaño del kernel (debe ser impar)
     * @returns {Matrix} Imagen filtrada
     */
    static applyMedianFilter(imageMatrix, kernelSize = 3) {
        const result = new Matrix(imageMatrix.rows, imageMatrix.columns);
        const halfKernel = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < imageMatrix.rows; y++) {
            for (let x = 0; x < imageMatrix.columns; x++) {
                const neighborhood = [];
                
                // Recoger vecindad
                for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                    for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                        const ny = y + ky;
                        const nx = x + kx;
                        
                        if (ny >= 0 && ny < imageMatrix.rows && nx >= 0 && nx < imageMatrix.columns) {
                            neighborhood.push(imageMatrix.get(ny, nx));
                        } else {
                            neighborhood.push(0); // Padding con ceros
                        }
                    }
                }
                
                // Calcular mediana
                neighborhood.sort((a, b) => a - b);
                const median = neighborhood[Math.floor(neighborhood.length / 2)];
                
                result.set(y, x, median);
            }
        }
        
        return result;
    }
    
    /**
     * Aplica filtro de balance de blancos
     * @param {Object} matrices - Matrices de canales RGB
     * @returns {Object} Matrices con balance de blancos ajustado
     */
    static applyWhiteBalance(matrices) {
        const { red, green, blue } = matrices;
        
        // Calcular promedio de cada canal
        const redMean = this.calculateChannelMean(red);
        const greenMean = this.calculateChannelMean(green);
        const blueMean = this.calculateChannelMean(blue);
        
        // Calcular factores de corrección (Gray World assumption)
        const grayValue = (redMean + greenMean + blueMean) / 3;
        const redFactor = grayValue / redMean;
        const greenFactor = grayValue / greenMean;
        const blueFactor = grayValue / blueMean;
        
        // Aplicar corrección
        const result = {
            red: MatrixOperations.elementWiseOperation(red, value => 
                Math.min(255, value * redFactor)
            ),
            green: MatrixOperations.elementWiseOperation(green, value => 
                Math.min(255, value * greenFactor)
            ),
            blue: MatrixOperations.elementWiseOperation(blue, value => 
                Math.min(255, value * blueFactor)
            )
        };
        
        return result;
    }
    
    /**
     * Calcula el promedio de un canal
     * @param {Matrix} matrix - Matriz del canal
     * @returns {number} Promedio
     */
    static calculateChannelMean(matrix) {
        const data = matrix.to1DArray();
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }
    
    /**
     * Genera explicación matemática del filtro
     * @param {string} filterType - Tipo de filtro
     * @param {Object} params - Parámetros del filtro
     * @returns {Object} Explicación detallada
     */
    static explainFilter(filterType, params = {}) {
        const explanation = {
            type: filterType,
            parameters: params,
            description: '',
            mathematicalOperation: '',
            formula: '',
            effect: '',
            applications: []
        };
        
        switch (filterType) {
            case 'blur':
                explanation.description = 'Filtro de desenfoque que suaviza la imagen';
                explanation.mathematicalOperation = 'Convolución con kernel Gaussiano';
                explanation.formula = `G(x,y) = (1/2πσ²) * e^(-(x²+y²)/2σ²)`;
                explanation.effect = 'Reduce detalles de alta frecuencia';
                explanation.applications = ['Reducción de ruido', 'Pre-procesamiento', 'Efectos artísticos'];
                break;
                
            case 'sharpen':
                explanation.description = 'Filtro de enfoque que realza bordes';
                explanation.mathematicalOperation = 'Convolución con kernel de alta frecuencia';
                explanation.formula = `I' = I + α * ∇²I`;
                explanation.effect = 'Aumenta el contraste en los bordes';
                explanation.applications = ['Mejora de imágenes', 'Realce de detalles', 'Corrección de enfoque'];
                break;
                
            case 'edge':
                explanation.description = 'Detección de bordes mediante operadores de gradiente';
                explanation.mathematicalOperation = 'Operadores Sobel o Laplaciano';
                explanation.formula = `G = √(Gx² + Gy²)`;
                explanation.effect = 'Identifica cambios bruscos de intensidad';
                explanation.applications = ['Visión computacional', 'Reconocimiento de objetos', 'Análisis de imágenes'];
                break;
                
            case 'grayscale':
                explanation.description = 'Conversión a escala de grises';
                explanation.mathematicalOperation = 'Combinación lineal de canales RGB';
                explanation.formula = `Gray = 0.299*R + 0.587*G + 0.114*B`;
                explanation.effect = 'Reduce dimensionalidad de color';
                explanation.applications = ['Procesamiento simplificado', 'Análisis de texturas', 'Compresión'];
                break;
                
            default:
                explanation.description = 'Filtro de procesamiento de imágenes';
                explanation.mathematicalOperation = 'Operación matricial';
                explanation.formula = 'I\' = f(I)';
                explanation.effect = 'Modifica las características de la imagen';
                explanation.applications = ['Procesamiento digital', 'Mejora de imágenes'];
        }
        
        return explanation;
    }
}
