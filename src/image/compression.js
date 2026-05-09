/**
 * Módulo de Compresión de Imágenes
 * Implementación de compresión usando descomposición SVD (Singular Value Decomposition)
 * y otras técnicas de álgebra lineal
 */

import { Matrix } from 'ml-matrix';
import { MatrixOperations } from '../algebra/matrices.js';
import { VectorOperations } from '../algebra/vectors.js';

export class ImageCompression {
    /**
     * Comprime una matriz de imagen usando SVD
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} compressionRatio - Ratio de compresión (0.1-0.9)
     * @returns {Object} Resultados de compresión
     */
    static compressWithSVD(imageMatrix, compressionRatio = 0.5) {
        // Realizar descomposición SVD
        const svd = imageMatrix.svd();
        
        // Determinar número de componentes a mantener
        const originalRank = Math.min(imageMatrix.rows, imageMatrix.columns);
        const compressedRank = Math.max(1, Math.floor(originalRank * compressionRatio));
        
        // Extraer componentes
        const U = svd.U.subMatrix(0, imageMatrix.rows, 0, compressedRank);
        const S = svd.S.slice(0, compressedRank);
        const V = svd.V.subMatrix(0, imageMatrix.columns, 0, compressedRank);
        
        // Crear matriz diagonal con valores singulares
        const SMatrix = new Matrix(compressedRank, compressedRank);
        for (let i = 0; i < compressedRank; i++) {
            SMatrix.set(i, i, S[i]);
        }
        
        // Reconstruir matriz comprimida
        const compressedMatrix = U.mmul(SMatrix).mmul(V.transpose());
        
        // Calcular estadísticas de compresión
        const originalSize = imageMatrix.rows * imageMatrix.columns;
        const compressedSize = (imageMatrix.rows * compressedRank) + 
                              (compressedRank) + 
                              (imageMatrix.columns * compressedRank);
        const actualCompressionRatio = compressedSize / originalSize;
        
        // Calcular error de reconstrucción
        const error = this.calculateReconstructionError(imageMatrix, compressedMatrix);
        
        return {
            originalMatrix: imageMatrix,
            compressedMatrix: compressedMatrix,
            components: {
                U: U,
                S: S,
                V: V
            },
            compressionRatio: actualCompressionRatio,
            originalRank: originalRank,
            compressedRank: compressedRank,
            error: error,
            spaceSaved: 1 - actualCompressionRatio,
            originalSize: originalSize,
            compressedSize: compressedSize
        };
    }
    
    /**
     * Comprime imagen a color usando SVD por canal
     * @param {Object} matrices - Matrices de canales RGB
     * @param {number} compressionRatio - Ratio de compresión
     * @returns {Object} Resultados de compresión por canal
     */
    static compressColorImage(matrices, compressionRatio = 0.5) {
        const channels = ['red', 'green', 'blue'];
        const results = {};
        
        for (const channel of channels) {
            results[channel] = this.compressWithSVD(matrices[channel], compressionRatio);
        }
        
        // Calcular estadísticas globales
        const totalOriginalSize = channels.reduce((sum, channel) => 
            sum + results[channel].originalSize, 0);
        const totalCompressedSize = channels.reduce((sum, channel) => 
            sum + results[channel].compressedSize, 0);
        const globalCompressionRatio = totalCompressedSize / totalOriginalSize;
        const averageError = channels.reduce((sum, channel) => 
            sum + results[channel].error, 0) / channels.length;
        
        return {
            channels: results,
            globalCompressionRatio: globalCompressionRatio,
            averageError: averageError,
            totalOriginalSize: totalOriginalSize,
            totalCompressedSize: totalCompressedSize
        };
    }
    
    /**
     * Calcula el error de reconstrucción (RMSE)
     * @param {Matrix} original - Matriz original
     * @param {Matrix} reconstructed - Matriz reconstruida
     * @returns {number} Error cuadrático medio
     */
    static calculateReconstructionError(original, reconstructed) {
        let sumSquaredError = 0;
        const totalPixels = original.rows * original.columns;
        
        for (let y = 0; y < original.rows; y++) {
            for (let x = 0; x < original.columns; x++) {
                const originalValue = original.get(y, x);
                const reconstructedValue = reconstructed.get(y, x);
                const error = originalValue - reconstructedValue;
                sumSquaredError += error * error;
            }
        }
        
        return Math.sqrt(sumSquaredError / totalPixels);
    }
    
    /**
     * Calcula la relación señal-ruido (PSNR)
     * @param {Matrix} original - Matriz original
     * @param {Matrix} reconstructed - Matriz reconstruida
     * @returns {number} PSNR en decibeles
     */
    static calculatePSNR(original, reconstructed) {
        const mse = this.calculateReconstructionError(original, reconstructed);
        const maxValue = 255; // Para imágenes de 8 bits
        
        if (mse === 0) {
            return Infinity; // Imágenes idénticas
        }
        
        return 20 * Math.log10(maxValue / mse);
    }
    
    /**
     * Calcula el índice de similitud estructural (SSIM)
     * @param {Matrix} original - Matriz original
     * @param {Matrix} reconstructed - Matriz reconstruida
     * @returns {number} Índice SSIM (-1 a 1)
     */
    static calculateSSIM(original, reconstructed) {
        // Parámetros estándar
        const K1 = 0.01;
        const K2 = 0.03;
        const L = 255;
        const C1 = (K1 * L) ** 2;
        const C2 = (K2 * L) ** 2;
        
        // Calcular medias
        const originalMean = this.calculateMean(original);
        const reconstructedMean = this.calculateMean(reconstructed);
        
        // Calcular varianzas y covarianza
        const originalVar = this.calculateVariance(original, originalMean);
        const reconstructedVar = this.calculateVariance(reconstructed, reconstructedMean);
        const covariance = this.calculateCovariance(original, reconstructed, originalMean, reconstructedMean);
        
        // Calcular SSIM
        const numerator = (2 * originalMean * reconstructedMean + C1) * 
                         (2 * covariance + C2);
        const denominator = (originalMean ** 2 + reconstructedMean ** 2 + C1) * 
                           (originalVar + reconstructedVar + C2);
        
        return numerator / denominator;
    }
    
    /**
     * Calcula la media de una matriz
     * @param {Matrix} matrix - Matriz
     * @returns {number} Media
     */
    static calculateMean(matrix) {
        const data = matrix.to1DArray();
        return data.reduce((sum, value) => sum + value, 0) / data.length;
    }
    
    /**
     * Calcula la varianza de una matriz
     * @param {Matrix} matrix - Matriz
     * @param {number} mean - Media precalculada
     * @returns {number} Varianza
     */
    static calculateVariance(matrix, mean) {
        const data = matrix.to1DArray();
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
        return variance;
    }
    
    /**
     * Calcula la covarianza entre dos matrices
     * @param {Matrix} matrixA - Primera matriz
     * @param {Matrix} matrixB - Segunda matriz
     * @param {number} meanA - Media de la primera matriz
     * @param {number} meanB - Media de la segunda matriz
     * @returns {number} Covarianza
     */
    static calculateCovariance(matrixA, matrixB, meanA, meanB) {
        const dataA = matrixA.to1DArray();
        const dataB = matrixB.to1DArray();
        
        let covariance = 0;
        for (let i = 0; i < dataA.length; i++) {
            covariance += (dataA[i] - meanA) * (dataB[i] - meanB);
        }
        
        return covariance / dataA.length;
    }
    
    /**
     * Compresión usando PCA (Análisis de Componentes Principales)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} numComponents - Número de componentes principales
     * @returns {Object} Resultados de compresión PCA
     */
    static compressWithPCA(imageMatrix, numComponents = 50) {
        // Centrar datos
        const mean = this.calculateMean(imageMatrix);
        const centered = MatrixOperations.elementWiseOperation(imageMatrix, value => value - mean);
        
        // Calcular matriz de covarianza
        const covariance = this.calculateCovarianceMatrix(centered);
        
        // Calcular eigenvalores y eigenvectores
        const eigenDecomposition = covariance.eig();
        
        // Seleccionar componentes principales
        const eigenvalues = eigenDecomposition.values;
        const eigenvectors = eigenDecomposition.vectors;
        
        // Ordenar por eigenvalor descendente
        const indices = this.argsort(eigenvalues.map(v => -v));
        const selectedEigenvectors = eigenvectors.subMatrix(0, eigenvectors.rows, 0, numComponents);
        
        // Proyectar datos
        const projected = centered.mmul(selectedEigenvectors);
        
        // Reconstruir
        const reconstructed = projected.mmul(selectedEigenvectors.transpose());
        const finalReconstructed = MatrixOperations.elementWiseOperation(reconstructed, value => value + mean);
        
        return {
            originalMatrix: imageMatrix,
            reconstructedMatrix: finalReconstructed,
            components: selectedEigenvectors,
            projected: projected,
            mean: mean,
            numComponents: numComponents,
            error: this.calculateReconstructionError(imageMatrix, finalReconstructed)
        };
    }
    
    /**
     * Calcula matriz de covarianza
     * @param {Matrix} matrix - Matriz centrada
     * @returns {Matrix} Matriz de covarianza
     */
    static calculateCovarianceMatrix(matrix) {
        const transpose = matrix.transpose();
        const covariance = transpose.mmul(matrix);
        return covariance.scale(1 / matrix.rows);
    }
    
    /**
     * Ordena índices según los valores
     * @param {Array} values - Valores a ordenar
     * @returns {Array} Índices ordenados
     */
    static argsort(values) {
        return values
            .map((value, index) => ({ value, index }))
            .sort((a, b) => a.value - b.value)
            .map(item => item.index);
    }
    
    /**
     * Compresión usando cuantificación vectorial (Vector Quantization)
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {number} codebookSize - Tamaño del codebook
     * @returns {Object} Resultados de cuantificación
     */
    static compressWithVectorQuantization(imageMatrix, codebookSize = 256) {
        // Aplanar matriz a vectores
        const vectors = this.matrixToVectors(imageMatrix);
        
        // Generar codebook inicial (k-means)
        const codebook = this.generateCodebook(vectors, codebookSize);
        
        // Asignar cada vector al código más cercano
        const indices = this.assignToCodebook(vectors, codebook);
        
        // Reconstruir imagen
        const reconstructedVectors = indices.map(index => codebook[index]);
        const reconstructedMatrix = this.vectorsToMatrix(reconstructedVectors, imageMatrix.rows, imageMatrix.columns);
        
        return {
            originalMatrix: imageMatrix,
            reconstructedMatrix: reconstructedMatrix,
            codebook: codebook,
            indices: indices,
            codebookSize: codebookSize,
            error: this.calculateReconstructionError(imageMatrix, reconstructedMatrix)
        };
    }
    
    /**
     * Convierte matriz a array de vectores
     * @param {Matrix} matrix - Matriz original
     * @returns {Array<Array<number>>} Array de vectores
     */
    static matrixToVectors(matrix) {
        const vectors = [];
        const blockSize = 4; // Bloques de 4x4 píxeles
        
        for (let y = 0; y < matrix.rows; y += blockSize) {
            for (let x = 0; x < matrix.columns; x += blockSize) {
                const vector = [];
                
                for (let dy = 0; dy < blockSize && y + dy < matrix.rows; dy++) {
                    for (let dx = 0; dx < blockSize && x + dx < matrix.columns; dx++) {
                        vector.push(matrix.get(y + dy, x + dx));
                    }
                }
                
                // Rellenar con ceros si es necesario
                while (vector.length < blockSize * blockSize) {
                    vector.push(0);
                }
                
                vectors.push(vector);
            }
        }
        
        return vectors;
    }
    
    /**
     * Convierte vectores de vuelta a matriz
     * @param {Array<Array<number>>} vectors - Array de vectores
     * @param {number} rows - Número de filas original
     * @param {number} cols - Número de columnas original
     * @returns {Matrix} Matriz reconstruida
     */
    static vectorsToMatrix(vectors, rows, cols) {
        const matrix = new Matrix(rows, cols);
        const blockSize = 4;
        let vectorIndex = 0;
        
        for (let y = 0; y < rows; y += blockSize) {
            for (let x = 0; x < cols; x += blockSize) {
                if (vectorIndex < vectors.length) {
                    const vector = vectors[vectorIndex];
                    let pixelIndex = 0;
                    
                    for (let dy = 0; dy < blockSize && y + dy < rows; dy++) {
                        for (let dx = 0; dx < blockSize && x + dx < cols; dx++) {
                            if (pixelIndex < vector.length) {
                                matrix.set(y + dy, x + dx, vector[pixelIndex]);
                                pixelIndex++;
                            }
                        }
                    }
                    
                    vectorIndex++;
                }
            }
        }
        
        return matrix;
    }
    
    /**
     * Genera codebook usando k-means simplificado
     * @param {Array<Array<number>>} vectors - Vectores de entrenamiento
     * @param {number} k - Número de clusters
     * @returns {Array<Array<number>>} Codebook
     */
    static generateCodebook(vectors, k) {
        // Inicialización aleatoria
        const codebook = [];
        const usedIndices = new Set();
        
        while (codebook.length < k && codebook.length < vectors.length) {
            const index = Math.floor(Math.random() * vectors.length);
            if (!usedIndices.has(index)) {
                codebook.push([...vectors[index]]);
                usedIndices.add(index);
            }
        }
        
        // K-means simplificado (unas pocas iteraciones)
        for (let iteration = 0; iteration < 5; iteration++) {
            // Asignar vectores a clusters
            const clusters = Array(k).fill(null).map(() => []);
            
            for (const vector of vectors) {
                const closestIndex = this.findClosestCodebookIndex(vector, codebook);
                clusters[closestIndex].push(vector);
            }
            
            // Actualizar centroides
            for (let i = 0; i < k; i++) {
                if (clusters[i].length > 0) {
                    codebook[i] = this.calculateCentroid(clusters[i]);
                }
            }
        }
        
        return codebook;
    }
    
    /**
     * Encuentra el índice del codebook más cercano
     * @param {Array<number>} vector - Vector a buscar
     * @param {Array<Array<number>>} codebook - Codebook
     * @returns {number} Índice más cercano
     */
    static findClosestCodebookIndex(vector, codebook) {
        let minDistance = Infinity;
        let closestIndex = 0;
        
        for (let i = 0; i < codebook.length; i++) {
            const distance = VectorOperations.euclideanDistance(vector, codebook[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        return closestIndex;
    }
    
    /**
     * Calcula el centroide de un cluster
     * @param {Array<Array<number>>} cluster - Cluster de vectores
     * @returns {Array<number>} Centroide
     */
    static calculateCentroid(cluster) {
        if (cluster.length === 0) return [];
        
        const dimension = cluster[0].length;
        const centroid = new Array(dimension).fill(0);
        
        for (const vector of cluster) {
            for (let i = 0; i < dimension; i++) {
                centroid[i] += vector[i];
            }
        }
        
        for (let i = 0; i < dimension; i++) {
            centroid[i] /= cluster.length;
        }
        
        return centroid;
    }
    
    /**
     * Asigna vectores al codebook más cercano
     * @param {Array<Array<number>>} vectors - Vectores a asignar
     * @param {Array<Array<number>>} codebook - Codebook
     * @returns {Array<number>} Índices asignados
     */
    static assignToCodebook(vectors, codebook) {
        return vectors.map(vector => this.findClosestCodebookIndex(vector, codebook));
    }
    
    /**
     * Compara diferentes métodos de compresión
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {Array<number>} compressionRatios - Ratios de compresión a probar
     * @returns {Object} Comparación de métodos
     */
    static compareCompressionMethods(imageMatrix, compressionRatios = [0.1, 0.3, 0.5, 0.7, 0.9]) {
        const results = {
            svd: [],
            pca: [],
            vectorQuantization: []
        };
        
        for (const ratio of compressionRatios) {
            // SVD
            const svdResult = this.compressWithSVD(imageMatrix, ratio);
            results.svd.push({
                ratio: ratio,
                compressionRatio: svdResult.compressionRatio,
                error: svdResult.error,
                psnr: this.calculatePSNR(imageMatrix, svdResult.compressedMatrix),
                ssim: this.calculateSSIM(imageMatrix, svdResult.compressedMatrix)
            });
            
            // PCA
            const numComponents = Math.max(1, Math.floor(Math.min(imageMatrix.rows, imageMatrix.columns) * ratio));
            const pcaResult = this.compressWithPCA(imageMatrix, numComponents);
            results.pca.push({
                ratio: ratio,
                numComponents: numComponents,
                error: pcaResult.error,
                psnr: this.calculatePSNR(imageMatrix, pcaResult.reconstructedMatrix),
                ssim: this.calculateSSIM(imageMatrix, pcaResult.reconstructedMatrix)
            });
            
            // Vector Quantization
            const codebookSize = Math.max(16, Math.floor(256 * ratio));
            const vqResult = this.compressWithVectorQuantization(imageMatrix, codebookSize);
            results.vectorQuantization.push({
                ratio: ratio,
                codebookSize: codebookSize,
                error: vqResult.error,
                psnr: this.calculatePSNR(imageMatrix, vqResult.reconstructedMatrix),
                ssim: this.calculateSSIM(imageMatrix, vqResult.reconstructedMatrix)
            });
        }
        
        return results;
    }
    
    /**
     * Genera explicación matemática del método de compresión
     * @param {string} method - Método de compresión
     * @returns {Object} Explicación detallada
     */
    static explainCompressionMethod(method) {
        const explanation = {
            method: method,
            description: '',
            mathematicalFoundation: '',
            algorithm: '',
            advantages: [],
            disadvantages: [],
            applications: [],
            formula: ''
        };
        
        switch (method) {
            case 'svd':
                explanation.description = 'Compresión usando Descomposición de Valores Singulares';
                explanation.mathematicalFoundation = 'A = UΣV^T donde U y V son ortogonales y Σ es diagonal';
                explanation.algorithm = '1. Calcular SVD de la matriz\n2. Mantener los k valores singulares más grandes\n3. Reconstruir con componentes reducidos';
                explanation.advantages = ['Compresión óptima en sentido L2', 'Preserva información importante', 'Control preciso del ratio'];
                explanation.disadvantages = ['Computacionalmente intensivo', 'Requiere matrices cuadradas o rectangulares'];
                explanation.applications = ['Compresión de imágenes', 'Reducción dimensional', 'Análisis de datos'];
                explanation.formula = 'A ≈ U_k Σ_k V_k^T';
                break;
                
            case 'pca':
                explanation.description = 'Compresión usando Análisis de Componentes Principales';
                explanation.mathematicalFoundation = 'Proyección sobre eigenvectores de la matriz de covarianza';
                explanation.algorithm = '1. Centrar datos\n2. Calcular matriz de covarianza\n3. Extraer eigenvectores\n4. Proyectar sobre componentes principales';
                explanation.advantages = ['Elimina correlación', 'Maximiza varianza', 'Eficiente para datos correlacionados'];
                explanation.disadvantages = ['Asume linealidad', 'Sensible a escala', 'Pérdida de información'];
                explanation.applications = ['Reducción dimensional', 'Reconocimiento de patrones', 'Análisis estadístico'];
                explanation.formula = 'Y = XW donde W contiene eigenvectores';
                break;
                
            case 'vectorQuantization':
                explanation.description = 'Compresión usando Cuantificación Vectorial';
                explanation.mathematicalFoundation = 'Agrupamiento de vectores similares en código compartido';
                explanation.algorithm = '1. Dividir imagen en bloques\n2. Generar codebook (k-means)\n3. Asignar bloques a códigos\n4. Reconstruir usando codebook';
                explanation.advantages = ['Simple implementación', 'Bueno para texturas', 'Compresión con pérdida controlada'];
                explanation.disadvantages = ['Efecto bloque', 'Depende del codebook', 'Pérdida de detalles finos'];
                explanation.applications = ['Compresión de video', 'Audio', 'Transmisión en tiempo real'];
                explanation.formula = 'x ≈ c_i donde c_i es el código más cercano';
                break;
                
            default:
                explanation.description = 'Método de compresión de imágenes';
                explanation.mathematicalFoundation = 'Reducción dimensional y aproximación';
                explanation.algorithm = 'Procesamiento matricial y optimización';
                explanation.advantages = ['Flexibilidad'];
                explanation.disadvantages = ['Compromiso calidad-tamaño'];
                explanation.applications = ['Almacenamiento y transmisión'];
        }
        
        return explanation;
    }
}
