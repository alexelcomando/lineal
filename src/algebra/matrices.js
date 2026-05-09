/**
 * Módulo de Operaciones Matriciales
 * Implementación de operaciones fundamentales de álgebra lineal
 * para el procesamiento de imágenes
 */

import { Matrix } from 'ml-matrix';

export class MatrixOperations {
    /**
     * Convierte un ImageData a una matriz NumPy-style
     * @param {ImageData} imageData - Datos de imagen del canvas
     * @param {string} channel - 'red', 'green', 'blue', 'alpha', 'grayscale'
     * @returns {Matrix} Matriz de valores de píxeles
     */
    static imageToMatrix(imageData, channel = 'grayscale') {
        const { width, height, data } = imageData;
        const matrix = [];

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;

                let value;
                switch (channel) {
                    case 'red':
                        value = data[index];
                        break;
                    case 'green':
                        value = data[index + 1];
                        break;
                    case 'blue':
                        value = data[index + 2];
                        break;
                    case 'alpha':
                        value = data[index + 3];
                        break;
                    case 'grayscale':
                        // Fórmula estándar de conversión a escala de grises
                        value = Math.round(0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2]);
                        break;
                    default:
                        value = data[index];
                }

                row.push(value);
            }
            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    /**
     * Convierte una matriz de vuelta a ImageData
     * @param {Matrix} matrix - Matriz de valores
     * @param {number} width - Ancho original
     * @param {number} height - Alto original
     * @param {string} channel - Canal de color
     * @returns {ImageData} ImageData reconstruido
     */
    static matrixToImage(matrix, width, height, channel = 'grayscale') {
        const imageData = new ImageData(width, height);
        const { data } = imageData;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const value = Math.min(255, Math.max(0, Math.round(matrix.get(y, x))));

                switch (channel) {
                    case 'red':
                        data[index] = value;
                        data[index + 1] = 0;
                        data[index + 2] = 0;
                        data[index + 3] = 255;
                        break;
                    case 'green':
                        data[index] = 0;
                        data[index + 1] = value;
                        data[index + 2] = 0;
                        data[index + 3] = 255;
                        break;
                    case 'blue':
                        data[index] = 0;
                        data[index + 1] = 0;
                        data[index + 2] = value;
                        data[index + 3] = 255;
                        break;
                    case 'grayscale':
                        data[index] = value;
                        data[index + 1] = value;
                        data[index + 2] = value;
                        data[index + 3] = 255;
                        break;
                    default:
                        data[index] = value;
                        data[index + 1] = value;
                        data[index + 2] = value;
                        data[index + 3] = 255;
                }
            }
        }

        return imageData;
    }

    /**
     * Crea una matriz de identidad
     * @param {number} size - Tamaño de la matriz
     * @returns {Matrix} Matriz identidad
     */
    static identity(size) {
        return Matrix.identity(size);
    }

    /**
     * Calcula el determinante de una matriz
     * @param {Matrix} matrix - Matriz cuadrada
     * @returns {number} Determinante
     */
    static determinant(matrix) {
        if (matrix.rows !== matrix.columns) {
            throw new Error('La matriz debe ser cuadrada para calcular el determinante');
        }
        return matrix.det();
    }

    /**
     * Calcula la traspuesta de una matriz
     * @param {Matrix} matrix - Matriz original
     * @returns {Matrix} Matriz traspuesta
     */
    static transpose(matrix) {
        return matrix.transpose();
    }

    /**
     * Calcula la inversa de una matriz
     * @param {Matrix} matrix - Matriz cuadrada invertible
     * @returns {Matrix} Matriz inversa
     */
    static inverse(matrix) {
        if (matrix.rows !== matrix.columns) {
            throw new Error('La matriz debe ser cuadrada para calcular la inversa');
        }
        return matrix.inverse();
    }

    /**
     * Multiplica dos matrices
     * @param {Matrix} matrixA - Primera matriz
     * @param {Matrix} matrixB - Segunda matriz
     * @returns {Matrix} Producto matricial
     */
    static multiply(matrixA, matrixB) {
        return matrixA.mmul(matrixB);
    }

    /**
     * Aplica una operación elemento por elemento
     * @param {Matrix} matrix - Matriz original
     * @param {Function} operation - Función a aplicar
     * @returns {Matrix} Matriz resultante
     */
    static elementWiseOperation(matrix, operation) {
        const result = matrix.clone();
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {
                result.set(i, j, operation(result.get(i, j)));
            }
        }
        return result;
    }

    /**
     * Normaliza una matriz al rango [0, 255]
     * @param {Matrix} matrix - Matriz a normalizar
     * @returns {Matrix} Matriz normalizada
     */
    static normalize(matrix) {
        const min = matrix.min();
        const max = matrix.max();
        const range = max - min;

        if (range === 0) {
            return new Matrix(matrix.rows, matrix.columns).fill(0);
        }

        return this.elementWiseOperation(matrix, value =>
            ((value - min) / range) * 255
        );
    }

    /**
     * Aplica padding a una matriz
     * @param {Matrix} matrix - Matriz original
     * @param {number} padding - Tamaño del padding
     * @param {number} fillValue - Valor de relleno
     * @returns {Matrix} Matriz con padding
     */
    static padMatrix(matrix, padding, fillValue = 0) {
        const newRows = matrix.rows + 2 * padding;
        const newCols = matrix.columns + 2 * padding;
        const paddedMatrix = new Matrix(newRows, newCols).fill(fillValue);

        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.columns; j++) {
                paddedMatrix.set(i + padding, j + padding, matrix.get(i, j));
            }
        }

        return paddedMatrix;
    }

    /**
     * Extrae una submatriz
     * @param {Matrix} matrix - Matriz original
     * @param {number} startRow - Fila inicial
     * @param {number} startCol - Columna inicial
     * @param {number} rows - Número de filas
     * @param {number} cols - Número de columnas
     * @returns {Matrix} Submatriz
     */
    static subMatrix(matrix, startRow, startCol, rows, cols) {
        return matrix.subMatrix(startRow, rows, startCol, cols);
    }

    /**
     * Calcula la norma de una matriz
     * @param {Matrix} matrix - Matriz
     * @param {string} type - 'frobenius', '1', '2', 'infinity'
     * @returns {number} Norma de la matriz
     */




    static norm(matrix, type = 'frobenius') {
        switch (type) {
            case 'frobenius':
                let sum = 0;
                for (let i = 0; i < matrix.rows; i++) {
                    for (let j = 0; j < matrix.columns; j++) {
                        sum += Math.pow(matrix.get(i, j), 2);
                    }
                }
                return Math.sqrt(sum);
            case '1':
                let maxColSum = 0;
                for (let j = 0; j < matrix.columns; j++) {
                    let colSum = 0;
                    for (let i = 0; i < matrix.rows; i++) {
                        colSum += Math.abs(matrix.get(i, j));
                    }
                    maxColSum = Math.max(maxColSum, colSum);
                }
                return maxColSum;
            case 'infinity':
                let maxRowSum = 0;
                for (let i = 0; i < matrix.rows; i++) {
                    let rowSum = 0;
                    for (let j = 0; j < matrix.columns; j++) {
                        rowSum += Math.abs(matrix.get(i, j));
                    }
                    maxRowSum = Math.max(maxRowSum, rowSum);
                }
                return maxRowSum;
            default:
                throw new Error(`Tipo de norma no soportado: ${type}`);
        }
    }

    /**
     * Formatea una matriz para visualización
     * @param {Matrix} matrix - Matriz a formatear
     * @param {number} precision - Número de decimales
     * @returns {string} Representación formateada
     */
    static formatMatrix(matrix, precision = 2) {
        let result = '';
        for (let i = 0; i < Math.min(matrix.rows, 10); i++) {
            result += '[';
            for (let j = 0; j < Math.min(matrix.columns, 10); j++) {
                const value = matrix.get(i, j).toFixed(precision);
                result += value.padStart(8, ' ');
                if (j < Math.min(matrix.columns, 10) - 1) result += ',';
            }
            result += ']';
            if (i < Math.min(matrix.rows, 10) - 1) result += '\n';
        }

        if (matrix.rows > 10 || matrix.columns > 10) {
            result += '\n... (matriz truncada para visualización)';
        }

        return result;
    }

    /**
     * Verifica si una matriz es simétrica
     * @param {Matrix} matrix - Matriz a verificar
     * @param {number} tolerance - Tolerancia para comparación
     * @returns {boolean} True si es simétrica
     */
    static isSymmetric(matrix, tolerance = 1e-10) {
        if (matrix.rows !== matrix.columns) {
            return false;
        }

        const transpose = this.transpose(matrix);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.columns; j++) {
                if (Math.abs(matrix.get(i, j) - transpose.get(i, j)) > tolerance) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Calcula el rango de una matriz
     * @param {Matrix} matrix - Matriz
     * @returns {number} Rango de la matriz
     */
    static rank(matrix) {
        // Implementación simple usando descomposición SVD
        const svd = matrix.svd();
        let rank = 0;
        const tolerance = 1e-10;

        for (let i = 0; i < svd.S.length; i++) {
            if (svd.S[i] > tolerance) {
                rank++;
            }
        }

        return rank;
    }
}
