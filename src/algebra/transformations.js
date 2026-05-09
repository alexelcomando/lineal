/**
 * Módulo de Transformaciones Lineales
 * Implementación de transformaciones geométricas usando álgebra lineal
 * para el procesamiento de imágenes
 */

import { Matrix } from 'ml-matrix';
import { VectorOperations } from './vectors.js';

export class LinearTransformations {
    /**
     * Crea una matriz de rotación 2D
     * @param {number} angle - Ángulo de rotación en radianes
     * @returns {Matrix} Matriz de rotación 2x2
     */
    static rotationMatrix2D(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return new Matrix([
            [cos, -sin],
            [sin, cos]
        ]);
    }
    
    /**
     * Crea una matriz de rotación 3D (coordenadas homogéneas)
     * @param {number} angle - Ángulo de rotación en radianes
     * @returns {Matrix} Matriz de rotación 3x3
     */
    static rotationMatrix3D(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return new Matrix([
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1]
        ]);
    }
    
    /**
     * Crea una matriz de escalado 2D
     * @param {number} scaleX - Factor de escalado en X
     * @param {number} scaleY - Factor de escalado en Y
     * @returns {Matrix} Matriz de escalado 2x2
     */
    static scalingMatrix2D(scaleX, scaleY) {
        return new Matrix([
            [scaleX, 0],
            [0, scaleY]
        ]);
    }
    
    /**
     * Crea una matriz de escalado 3D (coordenadas homogéneas)
     * @param {number} scaleX - Factor de escalado en X
     * @param {number} scaleY - Factor de escalado en Y
     * @returns {Matrix} Matriz de escalado 3x3
     */
    static scalingMatrix3D(scaleX, scaleY) {
        return new Matrix([
            [scaleX, 0, 0],
            [0, scaleY, 0],
            [0, 0, 1]
        ]);
    }
    
    /**
     * Crea una matriz de reflexión horizontal
     * @returns {Matrix} Matriz de reflexión horizontal 2x2
     */
    static reflectionHorizontalMatrix2D() {
        return new Matrix([
            [-1, 0],
            [0, 1]
        ]);
    }
    
    /**
     * Crea una matriz de reflexión vertical
     * @returns {Matrix} Matriz de reflexión vertical 2x2
     */
    static reflectionVerticalMatrix2D() {
        return new Matrix([
            [1, 0],
            [0, -1]
        ]);
    }
    
    /**
     * Crea una matriz de reflexión horizontal 3D
     * @returns {Matrix} Matriz de reflexión horizontal 3x3
     */
    static reflectionHorizontalMatrix3D() {
        return new Matrix([
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]);
    }
    
    /**
     * Crea una matriz de reflexión vertical 3D
     * @returns {Matrix} Matriz de reflexión vertical 3x3
     */
    static reflectionVerticalMatrix3D() {
        return new Matrix([
            [1, 0, 0],
            [0, -1, 0],
            [0, 0, 1]
        ]);
    }
    
    /**
     * Crea una matriz de traslación 3D (coordenadas homogéneas)
     * @param {number} translateX - Traslación en X
     * @param {number} translateY - Traslación en Y
     * @returns {Matrix} Matriz de traslación 3x3
     */
    static translationMatrix3D(translateX, translateY) {
        return new Matrix([
            [1, 0, translateX],
            [0, 1, translateY],
            [0, 0, 1]
        ]);
    }
    
    /**
     * Crea una matriz de cizallamiento (shear)
     * @param {number} shearX - Factor de cizallamiento en X
     * @param {number} shearY - Factor de cizallamiento en Y
     * @returns {Matrix} Matriz de cizallamiento 2x2
     */
    static shearMatrix2D(shearX, shearY) {
        return new Matrix([
            [1, shearX],
            [shearY, 1]
        ]);
    }
    
    /**
     * Crea una matriz de cizallamiento 3D
     * @param {number} shearX - Factor de cizallamiento en X
     * @param {number} shearY - Factor de cizallamiento en Y
     * @returns {Matrix} Matriz de cizallamiento 3x3
     */
    static shearMatrix3D(shearX, shearY) {
        return new Matrix([
            [1, shearX, 0],
            [shearY, 1, 0],
            [0, 0, 1]
        ]);
    }
    
    /**
     * Combina múltiples transformaciones lineales
     * @param {Array<Matrix>} matrices - Array de matrices de transformación
     * @returns {Matrix} Matriz de transformación combinada
     */
    static combineTransformations(matrices) {
        if (matrices.length === 0) {
            throw new Error('Se necesita al menos una matriz de transformación');
        }
        
        let combined = matrices[0].clone();
        for (let i = 1; i < matrices.length; i++) {
            combined = combined.mmul(matrices[i]);
        }
        
        return combined;
    }
    
    /**
     * Aplica una transformación a un punto 2D
     * @param {Array} point - Punto [x, y]
     * @param {Matrix} transformMatrix - Matriz de transformación 2x2
     * @returns {Array} Punto transformado
     */
    static transformPoint2D(point, transformMatrix) {
        if (point.length !== 2 || transformMatrix.rows !== 2 || transformMatrix.columns !== 2) {
            throw new Error('Dimensiones incompatibles');
        }
        
        const pointMatrix = new Matrix([point]);
        const transformed = pointMatrix.mmul(transformMatrix.transpose());
        
        return [transformed.get(0, 0), transformed.get(0, 1)];
    }
    
    /**
     * Aplica una transformación a un punto 3D (coordenadas homogéneas)
     * @param {Array} point - Punto [x, y, w]
     * @param {Matrix} transformMatrix - Matriz de transformación 3x3
     * @returns {Array} Punto transformado [x', y', w']
     */
    static transformPoint3D(point, transformMatrix) {
        if (point.length !== 3 || transformMatrix.rows !== 3 || transformMatrix.columns !== 3) {
            throw new Error('Dimensiones incompatibles');
        }
        
        const pointMatrix = new Matrix([point]);
        const transformed = pointMatrix.mmul(transformMatrix.transpose());
        
        // Normalizar coordenadas homogéneas
        const w = transformed.get(0, 2);
        if (w !== 0) {
            return [
                transformed.get(0, 0) / w,
                transformed.get(0, 1) / w,
                1
            ];
        }
        
        return [transformed.get(0, 0), transformed.get(0, 1), transformed.get(0, 2)];
    }
    
    /**
     * Aplica una transformación a una matriz de coordenadas
     * @param {Matrix} coordinates - Matriz de coordenadas (Nx2 o Nx3)
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @returns {Matrix} Coordenadas transformadas
     */
    static transformCoordinates(coordinates, transformMatrix) {
        return coordinates.mmul(transformMatrix.transpose());
    }
    
    /**
     * Crea una transformación compuesta completa
     * @param {Object} params - Parámetros de transformación
     * @param {number} params.rotation - Ángulo de rotación en radianes
     * @param {number} params.scaleX - Escalado en X
     * @param {number} params.scaleY - Escalado en Y
     * @param {number} params.translateX - Traslación en X
     * @param {number} params.translateY - Traslación en Y
     * @param {number} params.shearX - Cizallamiento en X
     * @param {number} params.shearY - Cizallamiento en Y
     * @returns {Matrix} Matriz de transformación compuesta 3x3
     */
    static createCompositeTransform(params) {
        const transforms = [];
        
        // Escalado
        if (params.scaleX !== undefined || params.scaleY !== undefined) {
            const sx = params.scaleX !== undefined ? params.scaleX : 1;
            const sy = params.scaleY !== undefined ? params.scaleY : 1;
            transforms.push(this.scalingMatrix3D(sx, sy));
        }
        
        // Cizallamiento
        if (params.shearX !== undefined || params.shearY !== undefined) {
            const shx = params.shearX !== undefined ? params.shearX : 0;
            const shy = params.shearY !== undefined ? params.shearY : 0;
            transforms.push(this.shearMatrix3D(shx, shy));
        }
        
        // Rotación
        if (params.rotation !== undefined) {
            transforms.push(this.rotationMatrix3D(params.rotation));
        }
        
        // Traslación
        if (params.translateX !== undefined || params.translateY !== undefined) {
            const tx = params.translateX !== undefined ? params.translateX : 0;
            const ty = params.translateY !== undefined ? params.translateY : 0;
            transforms.push(this.translationMatrix3D(tx, ty));
        }
        
        return this.combineTransformations(transforms);
    }
    
    /**
     * Calcula la inversa de una transformación
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @returns {Matrix} Matriz de transformación inversa
     */
    static inverseTransform(transformMatrix) {
        return transformMatrix.inverse();
    }
    
    /**
     * Verifica si una transformación preserva área
     * @param {Matrix} transformMatrix - Matriz de transformación 2x2
     * @returns {boolean} True si preserva área
     */
    static preservesArea(transformMatrix) {
        if (transformMatrix.rows !== 2 || transformMatrix.columns !== 2) {
            throw new Error('La matriz debe ser 2x2');
        }
        
        const det = transformMatrix.det();
        return Math.abs(det - 1) < 1e-10;
    }
    
    /**
     * Verifica si una transformación preserva orientación
     * @param {Matrix} transformMatrix - Matriz de transformación 2x2
     * @returns {boolean} True si preserva orientación
     */
    static preservesOrientation(transformMatrix) {
        if (transformMatrix.rows !== 2 || transformMatrix.columns !== 2) {
            throw new Error('La matriz debe ser 2x2');
        }
        
        return transformMatrix.det() > 0;
    }
    
    /**
     * Calcula el factor de escalado de una transformación
     * @param {Matrix} transformMatrix - Matriz de transformación 2x2
     * @returns {number} Factor de escalado (determinante)
     */
    static scalingFactor(transformMatrix) {
        if (transformMatrix.rows !== 2 || transformMatrix.columns !== 2) {
            throw new Error('La matriz debe ser 2x2');
        }
        
        return Math.abs(transformMatrix.det());
    }
    
    /**
     * Extrae los ángulos de Euler de una matriz de rotación
     * @param {Matrix} rotationMatrix - Matriz de rotación 2x2
     * @returns {number} Ángulo en radianes
     */
    static extractRotationAngle(rotationMatrix) {
        if (rotationMatrix.rows !== 2 || rotationMatrix.columns !== 2) {
            throw new Error('La matriz debe ser 2x2');
        }
        
        const cos = rotationMatrix.get(0, 0);
        const sin = rotationMatrix.get(1, 0);
        
        // Manejar ambigüedad del arccos
        let angle = Math.acos(Math.max(-1, Math.min(1, cos)));
        if (sin < 0) {
            angle = -angle;
        }
        
        return angle;
    }
    
    /**
     * Aplica una transformación a coordenadas de imagen
     * @param {Matrix} imageMatrix - Matriz de imagen
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @param {number} width - Ancho original
     * @param {number} height - Alto original
     * @returns {Matrix} Imagen transformada
     */
    static transformImage(imageMatrix, transformMatrix, width, height) {
        const transformedMatrix = new Matrix(imageMatrix.rows, imageMatrix.columns).fill(0);
        
        // Para cada píxel en la imagen de destino
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Convertir a coordenadas homogéneas
                const point = VectorOperations.createVector3D(x, y, 1);
                
                // Aplicar transformación inversa (mapeo inverso)
                const inverseTransform = this.inverseTransform(transformMatrix);
                const transformedPoint = this.transformPoint3D(point, inverseTransform);
                
                // Verificar si el punto está dentro de los límites
                const sourceX = Math.round(transformedPoint[0]);
                const sourceY = Math.round(transformedPoint[1]);
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    // Copiar valor del píxel fuente
                    const value = imageMatrix.get(sourceY, sourceX);
                    transformedMatrix.set(y, x, value);
                }
            }
        }
        
        return transformedMatrix;
    }
    
    /**
     * Genera una explicación matemática de la transformación
     * @param {Matrix} transformMatrix - Matriz de transformación
     * @param {string} type - Tipo de transformación
     * @returns {Object} Explicación detallada
     */
    static explainTransformation(transformMatrix, type) {
        const explanation = {
            type: type,
            matrix: transformMatrix,
            determinant: transformMatrix.det(),
            preservesArea: false,
            preservesOrientation: false,
            description: '',
            formula: ''
        };
        
        switch (type) {
            case 'rotation':
                const angle = this.extractRotationAngle(transformMatrix);
                explanation.description = `Rotación de ${(angle * 180 / Math.PI).toFixed(2)} grados`;
                explanation.formula = `R(θ) = [[cos(θ), -sin(θ)], [sin(θ), cos(θ)]]`;
                explanation.preservesArea = true;
                explanation.preservesOrientation = true;
                break;
                
            case 'scaling':
                explanation.description = `Escalado con factores Sx=${transformMatrix.get(0, 0).toFixed(2)}, Sy=${transformMatrix.get(1, 1).toFixed(2)}`;
                explanation.formula = `S = [[Sx, 0], [0, Sy]]`;
                explanation.preservesArea = Math.abs(transformMatrix.det() - 1) < 1e-10;
                explanation.preservesOrientation = transformMatrix.det() > 0;
                break;
                
            case 'reflection':
                explanation.description = 'Reflexión que invierte coordenadas';
                explanation.formula = 'Reflexión invierte el signo de una coordenada';
                explanation.preservesArea = true;
                explanation.preservesOrientation = false;
                break;
                
            case 'translation':
                explanation.description = `Traslación de (${transformMatrix.get(0, 2).toFixed(2)}, ${transformMatrix.get(1, 2).toFixed(2)})`;
                explanation.formula = 'T = [[1, 0, tx], [0, 1, ty], [0, 0, 1]]';
                explanation.preservesArea = true;
                explanation.preservesOrientation = true;
                break;
                
            default:
                explanation.description = 'Transformación lineal general';
                explanation.formula = 'T = matriz de transformación';
        }
        
        return explanation;
    }
}
