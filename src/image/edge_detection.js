/**
 * Módulo de Detección de Bordes
 * Implementación de algoritmos de detección de bordes usando álgebra lineal
 * y cálculo de gradientes espaciales
 */

import { Matrix } from 'ml-matrix';
import { MatrixOperations } from '../algebra/matrices.js';
import { ConvolutionOperations } from '../algebra/convolution.js';
import { VectorOperations } from '../algebra/vectors.js';

export class EdgeDetection {
    /**
     * Operadores de gradiente predefinidos
     */
    static GRADIENT_OPERATORS = {
        // Operador Sobel 3x3
        sobel3x3: {
            x: [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ],
            y: [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ]
        },
        
        // Operador Prewitt 3x3
        prewitt3x3: {
            x: [
                [-1, 0, 1],
                [-1, 0, 1],
                [-1, 0, 1]
            ],
            y: [
                [-1, -1, -1],
                [0, 0, 0],
                [1, 1, 1]
            ]
        },
        
        // Operador Roberts 2x2
        roberts2x2: {
            x: [
                [1, 0],
                [0, -1]
            ],
            y: [
                [0, 1],
                [-1, 0]
            ]
        },
        
        // Operador Scharr 3x3
        scharr3x3: {
            x: [
                [-3, 0, 3],
                [-10, 0, 10],
                [-3, 0, 3]
            ],
            y: [
                [-3, -10, -3],
                [0, 0, 0],
                [3, 10, 3]
            ]
        }
    };
    
    /**
     * Detecta bordes usando operadores de gradiente
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {string} operator - Tipo de operador
     * @param {number} threshold - Umbral de detección
     * @returns {Object} Resultados de detección
     */
    static detectEdges(imageMatrix, operator = 'sobel3x3', threshold = 50) {
        const kernels = this.GRADIENT_OPERATORS[operator];
        if (!kernels) {
            throw new Error(`Operador no encontrado: ${operator}`);
        }
        
        // Calcular gradientes
        const gradientX = ConvolutionOperations.convolve(imageMatrix, kernels.x, 'replicate');
        const gradientY = ConvolutionOperations.convolve(imageMatrix, kernels.y, 'replicate');
        
        // Calcular magnitud y dirección del gradiente
        const magnitude = this.calculateGradientMagnitude(gradientX, gradientY);
        const direction = this.calculateGradientDirection(gradientX, gradientY);
        
        // Aplicar umbral
        const thresholded = this.applyThreshold(magnitude, threshold);
        
        // Non-maximum suppression (opcional, para bordes más finos)
        const suppressed = this.nonMaximumSuppression(magnitude, direction);
        const finalResult = this.applyThreshold(suppressed, threshold);
        
        return {
            gradientX: gradientX,
            gradientY: gradientY,
            magnitude: magnitude,
            direction: direction,
            thresholded: thresholded,
            suppressed: finalResult,
            operator: operator,
            threshold: threshold
        };
    }
    
    /**
     * Calcula la magnitud del gradiente
     * @param {Matrix} gradientX - Gradiente en X
     * @param {Matrix} gradientY - Gradiente en Y
     * @returns {Matrix} Magnitud del gradiente
     */
    static calculateGradientMagnitude(gradientX, gradientY) {
        const magnitude = new Matrix(gradientX.rows, gradientX.columns);
        
        for (let y = 0; y < gradientX.rows; y++) {
            for (let x = 0; x < gradientX.columns; x++) {
                const gx = gradientX.get(y, x);
                const gy = gradientY.get(y, x);
                const mag = Math.sqrt(gx * gx + gy * gy);
                magnitude.set(y, x, mag);
            }
        }
        
        return magnitude;
    }
    
    /**
     * Calcula la dirección del gradiente en radianes
     * @param {Matrix} gradientX - Gradiente en X
     * @param {Matrix} gradientY - Gradiente en Y
     * @returns {Matrix} Dirección del gradiente
     */
    static calculateGradientDirection(gradientX, gradientY) {
        const direction = new Matrix(gradientX.rows, gradientX.columns);
        
        for (let y = 0; y < gradientX.rows; y++) {
            for (let x = 0; x < gradientX.columns; x++) {
                const gx = gradientX.get(y, x);
                const gy = gradientY.get(y, x);
                const dir = Math.atan2(gy, gx);
                direction.set(y, x, dir);
            }
        }
        
        return direction;
    }
    
    /**
     * Aplica umbral a la magnitud del gradiente
     * @param {Matrix} magnitude - Magnitud del gradiente
     * @param {number} threshold - Umbral
     * @returns {Matrix} Imagen binarizada
     */
    static applyThreshold(magnitude, threshold) {
        return MatrixOperations.elementWiseOperation(magnitude, value => 
            value > threshold ? 255 : 0
        );
    }
    
    /**
     * Non-maximum suppression para bordes finos
     * @param {Matrix} magnitude - Magnitud del gradiente
     * @param {Matrix} direction - Dirección del gradiente
     * @returns {Matrix} Magnitud suprimida
     */
    static nonMaximumSuppression(magnitude, direction) {
        const result = magnitude.clone();
        
        for (let y = 1; y < magnitude.rows - 1; y++) {
            for (let x = 1; x < magnitude.columns - 1; x++) {
                const angle = direction.get(y, x);
                const current = magnitude.get(y, x);
                
                // Determinar vecinos según la dirección
                let neighbor1, neighbor2;
                
                // Cuantificar ángulo a 0°, 45°, 90°, 135°
                const quantizedAngle = this.quantizeAngle(angle);
                
                switch (quantizedAngle) {
                    case 0: // Horizontal
                        neighbor1 = magnitude.get(y, x - 1);
                        neighbor2 = magnitude.get(y, x + 1);
                        break;
                    case 45: // Diagonal \
                        neighbor1 = magnitude.get(y - 1, x - 1);
                        neighbor2 = magnitude.get(y + 1, x + 1);
                        break;
                    case 90: // Vertical
                        neighbor1 = magnitude.get(y - 1, x);
                        neighbor2 = magnitude.get(y + 1, x);
                        break;
                    case 135: // Diagonal /
                        neighbor1 = magnitude.get(y - 1, x + 1);
                        neighbor2 = magnitude.get(y + 1, x - 1);
                        break;
                }
                
                // Suprimir si no es máximo local
                if (current < neighbor1 || current < neighbor2) {
                    result.set(y, x, 0);
                }
            }
        }
        
        return result;
    }
    
    /**
     * Cuantifica el ángulo a direcciones principales
     * @param {number} angle - Ángulo en radianes
     * @returns {number} Ángulo cuantificado (0, 45, 90, 135)
     */
    static quantizeAngle(angle) {
        const degrees = (angle * 180 / Math.PI + 180) % 180;
        
        if (degrees < 22.5 || degrees >= 157.5) return 0;
        if (degrees < 67.5) return 45;
        if (degrees < 112.5) return 90;
        return 135;
    }
    
    /**
     * Detecta bordes usando el operador Laplaciano
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} threshold - Umbral
     * @returns {Matrix} Bordes detectados
     */
    static laplacianEdgeDetection(imageMatrix, threshold = 30) {
        // Kernel Laplaciano 3x3
        const laplacianKernel = [
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0]
        ];
        
        const laplacian = ConvolutionOperations.convolve(imageMatrix, laplacianKernel, 'replicate');
        
        // Encontrar cruces por cero (zero-crossing)
        const zeroCrossing = this.findZeroCrossings(laplacian, threshold);
        
        return zeroCrossing;
    }
    
    /**
     * Encuentra cruces por cero en el Laplaciano
     * @param {Matrix} laplacian - Matriz Laplaciana
     * @param {number} threshold - Umbral
     * @returns {Matrix} Cruces por cero
     */
    static findZeroCrossings(laplacian, threshold) {
        const result = new Matrix(laplacian.rows, laplacian.columns).fill(0);
        
        for (let y = 1; y < laplacian.rows - 1; y++) {
            for (let x = 1; x < laplacian.columns - 1; x++) {
                const current = laplacian.get(y, x);
                
                // Verificar vecinos
                const neighbors = [
                    laplacian.get(y - 1, x),
                    laplacian.get(y + 1, x),
                    laplacian.get(y, x - 1),
                    laplacian.get(y, x + 1)
                ];
                
                // Buscar cruces por cero
                for (const neighbor of neighbors) {
                    if ((current * neighbor < 0) && (Math.abs(current - neighbor) > threshold)) {
                        result.set(y, x, 255);
                        break;
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * Implementación simplificada del algoritmo de Canny
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} lowThreshold - Umbral inferior
     * @param {number} highThreshold - Umbral superior
     * @returns {Matrix} Bordes detectados
     */
    static cannyEdgeDetection(imageMatrix, lowThreshold = 50, highThreshold = 150) {
        // Paso 1: Suavizado Gaussiano
        const smoothed = ConvolutionOperations.convolve(
            imageMatrix, 
            ConvolutionOperations.createGaussianKernel(5, 1.4), 
            'replicate'
        );
        
        // Paso 2: Gradientes (Sobel)
        const edges = this.detectEdges(smoothed, 'sobel3x3', 0);
        
        // Paso 3: Non-maximum suppression
        const suppressed = this.nonMaximumSuppression(edges.magnitude, edges.direction);
        
        // Paso 4: Doble umbral e histeresis
        const finalEdges = this.hysteresisThresholding(suppressed, lowThreshold, highThreshold);
        
        return finalEdges;
    }
    
    /**
     * Aplica histeresis para conectar bordes
     * @param {Matrix} magnitude - Magnitud del gradiente
     * @param {number} lowThreshold - Umbral inferior
     * @param {number} highThreshold - Umbral superior
     * @returns {Matrix} Bordes finales
     */
    static hysteresisThresholding(magnitude, lowThreshold, highThreshold) {
        const rows = magnitude.rows;
        const cols = magnitude.columns;
        const result = new Matrix(rows, cols).fill(0);
        const visited = new Matrix(rows, cols).fill(0);
        
        // Identificar píxeles fuertes y débiles
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const value = magnitude.get(y, x);
                
                if (value >= highThreshold) {
                    result.set(y, x, 255);
                } else if (value < lowThreshold) {
                    result.set(y, x, 0);
                }
                // Los píxeles entre umbrales se decidirán por conectividad
            }
        }
        
        // Conectar píxeles débiles a fuertes
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                const value = magnitude.get(y, x);
                
                if (value >= lowThreshold && value < highThreshold) {
                    // Verificar si hay píxeles fuertes vecinos
                    if (this.hasStrongNeighbor(result, y, x)) {
                        result.set(y, x, 255);
                    } else {
                        result.set(y, x, 0);
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * Verifica si hay píxeles fuertes vecinos
     * @param {Matrix} result - Matriz de resultados
     * @param {number} y - Coordenada Y
     * @param {number} x - Coordenada X
     * @returns {boolean} True si hay vecinos fuertes
     */
    static hasStrongNeighbor(result, y, x) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0) continue;
                
                const ny = y + dy;
                const nx = x + dx;
                
                if (result.get(ny, nx) === 255) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Detecta contornos usando análisis de componentes conectados
     * @param {Matrix} binaryImage - Imagen binaria
     * @returns {Array<Array<Object>>} Array de contornos
     */
    static detectContours(binaryImage) {
        const contours = [];
        const visited = new Matrix(binaryImage.rows, binaryImage.columns).fill(0);
        
        for (let y = 0; y < binaryImage.rows; y++) {
            for (let x = 0; x < binaryImage.columns; x++) {
                if (binaryImage.get(y, x) > 0 && visited.get(y, x) === 0) {
                    const contour = this.traceContour(binaryImage, visited, y, x);
                    if (contour.length > 0) {
                        contours.push(contour);
                    }
                }
            }
        }
        
        return contours;
    }
    
    /**
     * Traza un contorno usando algoritmo de seguimiento de bordes
     * @param {Matrix} binaryImage - Imagen binaria
     * @param {Matrix} visited - Matriz de visitados
     * @param {number} startY - Coordenada Y inicial
     * @param {number} startX - Coordenada X inicial
     * @returns {Array<Object>} Puntos del contorno
     */
    static traceContour(binaryImage, visited, startY, startX) {
        const contour = [];
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const point = stack.pop();
            const {x, y} = point;
            
            if (visited.get(y, x) === 1) continue;
            if (binaryImage.get(y, x) === 0) continue;
            
            visited.set(y, x, 1);
            contour.push(point);
            
            // Agregar vecinos
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dy === 0 && dx === 0) continue;
                    
                    const ny = y + dy;
                    const nx = x + dx;
                    
                    if (ny >= 0 && ny < binaryImage.rows && 
                        nx >= 0 && nx < binaryImage.columns &&
                        visited.get(ny, nx) === 0 && 
                        binaryImage.get(ny, nx) > 0) {
                        stack.push({x: nx, y: ny});
                    }
                }
            }
        }
        
        return contour;
    }
    
    /**
     * Calcula propiedades de los contornos
     * @param {Array<Array<Object>>} contours - Array de contornos
     * @returns {Array<Object>} Propiedades de cada contorno
     */
    static calculateContourProperties(contours) {
        return contours.map(contour => {
            if (contour.length === 0) {
                return null;
            }
            
            // Calcular centroide
            const centroidX = contour.reduce((sum, p) => sum + p.x, 0) / contour.length;
            const centroidY = contour.reduce((sum, p) => sum + p.y, 0) / contour.length;
            
            // Calcular área (aproximada)
            let area = 0;
            for (let i = 0; i < contour.length; i++) {
                const p1 = contour[i];
                const p2 = contour[(i + 1) % contour.length];
                area += (p1.x * p2.y - p2.x * p1.y);
            }
            area = Math.abs(area) / 2;
            
            // Calcular perímetro
            let perimeter = 0;
            for (let i = 0; i < contour.length; i++) {
                const p1 = contour[i];
                const p2 = contour[(i + 1) % contour.length];
                perimeter += VectorOperations.euclideanDistance([p1.x, p1.y], [p2.x, p2.y]);
            }
            
            // Calcular circularidad
            const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
            
            // Calcular bounding box
            const xCoords = contour.map(p => p.x);
            const yCoords = contour.map(p => p.y);
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);
            
            return {
                points: contour,
                centroid: {x: centroidX, y: centroidY},
                area: area,
                perimeter: perimeter,
                circularity: circularity,
                boundingBox: {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY
                },
                length: contour.length
            };
        }).filter(contour => contour !== null);
    }
    
    /**
     * Genera explicación matemática del algoritmo de detección
     * @param {string} method - Método de detección
     * @returns {Object} Explicación detallada
     */
    static explainEdgeDetection(method) {
        const explanation = {
            method: method,
            description: '',
            mathematicalFoundation: '',
            algorithm: '',
            advantages: [],
            disadvantages: [],
            applications: []
        };
        
        switch (method) {
            case 'sobel':
                explanation.description = 'Detección de bordes usando operadores Sobel';
                explanation.mathematicalFoundation = 'Aproximación de derivadas parciales mediante convolución';
                explanation.algorithm = '1. Convolución con kernels Gx y Gy\n2. Cálculo de magnitud: √(Gx² + Gy²)\n3. Aplicación de umbral';
                explanation.advantages = ['Simple de implementar', 'Buen rendimiento', 'Robusto al ruido'];
                explanation.disadvantages = ['Bordes gruesos', 'Sensible a la orientación'];
                explanation.applications = ['Procesamiento en tiempo real', 'Detección preliminar'];
                break;
                
            case 'laplacian':
                explanation.description = 'Detección de bordes usando operador Laplaciano';
                explanation.mathematicalFoundation = 'Segunda derivada: ∇²f = ∂²f/∂x² + ∂²f/∂y²';
                explanation.algorithm = '1. Convolución con kernel Laplaciano\n2. Detección de cruces por cero\n3. Filtrado de resultados';
                explanation.advantages = ['Detecta bordes finos', 'Invariante a rotación'];
                explanation.disadvantages = ['Muy sensible al ruido', 'Requiere suavizado previo'];
                explanation.applications = ['Detección precisa', 'Análisis de texturas'];
                break;
                
            case 'canny':
                explanation.description = 'Algoritmo de Canny para detección óptima de bordes';
                explanation.mathematicalFoundation = 'Optimización usando criterios de detección, localización y respuesta única';
                explanation.algorithm = '1. Suavizado Gaussiano\n2. Gradientes (Sobel)\n3. Non-maximum suppression\n4. Doble umbral e histeresis';
                explanation.advantages = ['Bordes finos y continuos', 'Robusto al ruido', 'Óptimo teóricamente'];
                explanation.disadvantages = ['Computacionalmente intensivo', 'Múltiples parámetros'];
                explanation.applications = ['Visión computacional', 'Reconocimiento de objetos', 'Sistemas de alta precisión'];
                break;
                
            default:
                explanation.description = 'Método de detección de bordes';
                explanation.mathematicalFoundation = 'Cálculo de gradientes espaciales';
                explanation.algorithm = 'Procesamiento matricial y análisis de derivadas';
                explanation.advantages = ['Versatilidad'];
                explanation.disadvantages = ['Dependiente de parámetros'];
                explanation.applications = ['Procesamiento general de imágenes'];
        }
        
        return explanation;
    }
}
