/**
 * Módulo de Visualización de Vectores
 * Implementación de visualizaciones interactivas para vectores y operaciones vectoriales
 */

import { VectorOperations } from '../algebra/vectors.js';

export class VectorVisualization {
    /**
     * Visualiza vectores en un plano 2D
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<Array<number>>} vectors - Array de vectores 2D
     * @param {Object} options - Opciones de visualización
     */
    static visualizeVectors2D(canvas, vectors, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            scale = 1,
            colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
            showComponents = true,
            showGrid = true,
            origin = { x: canvas.width / 2, y: canvas.height / 2 }
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grid y ejes
        if (showGrid) {
            this.drawGrid(ctx, canvas.width, canvas.height);
        }
        this.drawAxes(ctx, origin);
        
        // Encontrar límites para escalado automático
        const allVectors = vectors.flat();
        const maxMagnitude = Math.max(...allVectors.map(v => VectorOperations.magnitude(v)));
        const autoScale = scale * Math.min(canvas.width, canvas.height) / (2 * maxMagnitude + 50);
        
        // Dibujar vectores
        vectors.forEach((vector, index) => {
            const color = colors[index % colors.length];
            const scaledVector = VectorOperations.scalarMultiply(vector, autoScale);
            
            // Dibujar vector
            this.drawVector2D(ctx, origin, scaledVector, color, showComponents);
            
            // Etiqueta
            const labelX = origin.x + scaledVector[0];
            const labelY = origin.y - scaledVector[1];
            
            ctx.fillStyle = color;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`v${index + 1}`, labelX + 15, labelY - 5);
            
            // Mostrar componentes
            if (showComponents) {
                ctx.font = '12px Arial';
                ctx.fillText(`(${vector[0].toFixed(1)}, ${vector[1].toFixed(1)})`, labelX + 15, labelY + 10);
            }
        });
        
        return {
            canvas: canvas,
            vectors: vectors,
            scale: autoScale,
            origin: origin
        };
    }
    
    /**
     * Dibuja grid de coordenadas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} width - Ancho del canvas
     * @param {number} height - Alto del canvas
     */
    static drawGrid(ctx, width, height) {
        const gridSize = 20;
        
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    /**
     * Dibuja ejes coordenados
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen de coordenadas
     */
    static drawAxes(ctx, origin) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(0, origin.y);
        ctx.lineTo(ctx.canvas.width, origin.y);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(origin.x, 0);
        ctx.lineTo(origin.x, ctx.canvas.height);
        ctx.stroke();
        
        // Flechas
        this.drawArrow(ctx, ctx.canvas.width - 10, origin.y, ctx.canvas.width, origin.y);
        this.drawArrow(ctx, origin.x, 10, origin.x, 0);
        
        // Etiquetas
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X', ctx.canvas.width - 20, origin.y - 10);
        ctx.fillText('Y', origin.x + 20, 20);
        
        // Origen
        ctx.fillText('O', origin.x - 15, origin.y + 20);
    }
    
    /**
     * Dibuja un vector 2D
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen del vector
     * @param {Array<number>} vector - Vector a dibujar
     * @param {string} color - Color del vector
     * @param {boolean} showComponents - Mostrar componentes
     */
    static drawVector2D(ctx, origin, vector, color, showComponents = true) {
        const endX = origin.x + vector[0];
        const endY = origin.y - vector[1]; // Invertir Y para sistema de coordenadas estándar
        
        // Dibujar línea principal
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Dibujar flecha
        this.drawArrow(ctx, origin.x, origin.y, endX, endY, color);
        
        // Dibujar componentes
        if (showComponents && (Math.abs(vector[0]) > 5 || Math.abs(vector[1]) > 5)) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            // Componente X
            if (Math.abs(vector[0]) > 5) {
                ctx.beginPath();
                ctx.moveTo(origin.x, origin.y);
                ctx.lineTo(endX, origin.y);
                ctx.stroke();
            }
            
            // Componente Y
            if (Math.abs(vector[1]) > 5) {
                ctx.beginPath();
                ctx.moveTo(endX, origin.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            
            ctx.setLineDash([]);
        }
    }
    
    /**
     * Dibuja una flecha
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} fromX - X inicial
     * @param {number} fromY - Y inicial
     * @param {number} toX - X final
     * @param {number} toY - Y final
     * @param {string} color - Color de la flecha
     */
    static drawArrow(ctx, fromX, fromY, toX, toY, color = '#333') {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        
        // Línea principal
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Cabeza de flecha
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Visualiza operaciones vectoriales (suma, resta, producto punto)
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<number>} vectorA - Primer vector
     * @param {Array<number>} vectorB - Segundo vector
     * @param {string} operation - Tipo de operación
     * @param {Object} options - Opciones de visualización
     */
    static visualizeVectorOperation(canvas, vectorA, vectorB, operation, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            scale = 1,
            showResult = true,
            showSteps = true
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grid y ejes
        this.drawGrid(ctx, canvas.width, canvas.height);
        this.drawAxes(ctx, origin);
        
        // Calcular escala
        const maxMagnitude = Math.max(
            VectorOperations.magnitude(vectorA),
            VectorOperations.magnitude(vectorB)
        );
        const autoScale = scale * Math.min(canvas.width, canvas.height) / (2 * maxMagnitude + 50);
        
        // Escalar vectores
        const scaledA = VectorOperations.scalarMultiply(vectorA, autoScale);
        const scaledB = VectorOperations.scalarMultiply(vectorB, autoScale);
        
        // Dibujar vectores originales
        this.drawVector2D(ctx, origin, scaledA, '#e74c3c', true);
        this.drawVector2D(ctx, origin, scaledB, '#3498db', true);
        
        // Etiquetas
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('A', origin.x + scaledA[0] + 15, origin.y - scaledA[1] - 5);
        
        ctx.fillStyle = '#3498db';
        ctx.fillText('B', origin.x + scaledB[0] + 15, origin.y - scaledB[1] - 5);
        
        // Calcular y mostrar resultado
        let result;
        let resultColor = '#2ecc71';
        let operationSymbol;
        
        switch (operation) {
            case 'add':
                result = VectorOperations.add(vectorA, vectorB);
                operationSymbol = '+';
                break;
            case 'subtract':
                result = VectorOperations.subtract(vectorA, vectorB);
                operationSymbol = '-';
                resultColor = '#f39c12';
                break;
            case 'dot':
                const dotProduct = VectorOperations.dotProduct(vectorA, vectorB);
                this.showDotProductResult(ctx, origin, scaledA, scaledB, dotProduct);
                return { canvas, vectorA, vectorB, operation, result: dotProduct };
            default:
                result = VectorOperations.add(vectorA, vectorB);
                operationSymbol = '+';
        }
        
        if (showResult && operation !== 'dot') {
            const scaledResult = VectorOperations.scalarMultiply(result, autoScale);
            this.drawVector2D(ctx, origin, scaledResult, resultColor, true);
            
            // Etiqueta del resultado
            ctx.fillStyle = resultColor;
            ctx.fillText(`A ${operationSymbol} B`, origin.x + scaledResult[0] + 15, origin.y - scaledResult[1] - 5);
        }
        
        // Mostrar pasos intermedios
        if (showSteps && operation === 'add') {
            this.showAdditionSteps(ctx, origin, scaledA, scaledB);
        } else if (showSteps && operation === 'subtract') {
            this.showSubtractionSteps(ctx, origin, scaledA, scaledB);
        }
        
        return {
            canvas: canvas,
            vectorA: vectorA,
            vectorB: vectorB,
            operation: operation,
            result: result
        };
    }
    
    /**
     * Muestra resultado de producto punto
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen
     * @param {Array<number>} vectorA - Vector A escalado
     * @param {Array<number>} vectorB - Vector B escalado
     * @param {number} dotProduct - Producto punto
     */
    static showDotProductResult(ctx, origin, vectorA, vectorB, dotProduct) {
        // Dibujar ángulo entre vectores
        const angleA = Math.atan2(-vectorA[1], vectorA[0]);
        const angleB = Math.atan2(-vectorB[1], vectorB[0]);
        
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 50, angleB, angleA);
        ctx.stroke();
        
        // Mostrar resultado
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`A · B = ${dotProduct.toFixed(2)}`, origin.x, 30);
        
        // Mostrar ángulo
        const angle = VectorOperations.angleBetween(
            [vectorA[0], -vectorA[1]], 
            [vectorB[0], -vectorB[1]]
        );
        ctx.fillText(`θ = ${(angle * 180 / Math.PI).toFixed(1)}°`, origin.x, 50);
    }
    
    /**
     * Muestra pasos de suma vectorial
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen
     * @param {Array<number>} vectorA - Vector A escalado
     * @param {Array<number>} vectorB - Vector B escalado
     */
    static showAdditionSteps(ctx, origin, vectorA, vectorB) {
        // Mover vector B al final de A
        const movedB = [origin.x + vectorA[0], origin.y - vectorA[1]];
        
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        this.drawVector2D(ctx, movedB, vectorB, '#3498db', false);
        ctx.setLineDash([]);
    }
    
    /**
     * Muestra pasos de resta vectorial
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {Object} origin - Origen
     * @param {Array<number>} vectorA - Vector A escalado
     * @param {Array<number>} vectorB - Vector B escalado
     */
    static showSubtractionSteps(ctx, origin, vectorA, vectorB) {
        // Mostrar -B
        const negatedB = VectorOperations.scalarMultiply(vectorB, -1);
        
        ctx.strokeStyle = 'rgba(243, 156, 18, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        this.drawVector2D(ctx, origin, negatedB, '#f39c12', false);
        ctx.setLineDash([]);
    }
    
    /**
     * Visualiza proyección vectorial
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<number>} vector - Vector a proyectar
     * @param {Array<number>} onto - Vector sobre el cual proyectar
     * @param {Object} options - Opciones de visualización
     */
    static visualizeProjection(canvas, vector, onto, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            scale = 1,
            showComponents = true,
            showOrthogonal = true
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grid y ejes
        this.drawGrid(ctx, canvas.width, canvas.height);
        this.drawAxes(ctx, origin);
        
        // Calcular escala
        const maxMagnitude = Math.max(
            VectorOperations.magnitude(vector),
            VectorOperations.magnitude(onto)
        );
        const autoScale = scale * Math.min(canvas.width, canvas.height) / (2 * maxMagnitude + 50);
        
        // Escalar vectores
        const scaledVector = VectorOperations.scalarMultiply(vector, autoScale);
        const scaledOnto = VectorOperations.scalarMultiply(onto, autoScale);
        
        // Calcular proyección
        const projection = VectorOperations.projection(vector, onto);
        const scaledProjection = VectorOperations.scalarMultiply(projection, autoScale);
        
        // Dibujar vectores
        this.drawVector2D(ctx, origin, scaledVector, '#e74c3c', true);
        this.drawVector2D(ctx, origin, scaledOnto, '#3498db', true);
        this.drawVector2D(ctx, origin, scaledProjection, '#2ecc71', true);
        
        // Dibujar línea perpendicular
        if (showOrthogonal) {
            const projectionEnd = {
                x: origin.x + scaledProjection[0],
                y: origin.y - scaledProjection[1]
            };
            const vectorEnd = {
                x: origin.x + scaledVector[0],
                y: origin.y - scaledVector[1]
            };
            
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(projectionEnd.x, projectionEnd.y);
            ctx.lineTo(vectorEnd.x, vectorEnd.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Etiquetas
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('v', origin.x + scaledVector[0] + 15, origin.y - scaledVector[1] - 5);
        
        ctx.fillStyle = '#3498db';
        ctx.fillText('u', origin.x + scaledOnto[0] + 15, origin.y - scaledOnto[1] - 5);
        
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('projᵤ(v)', origin.x + scaledProjection[0] + 15, origin.y - scaledProjection[1] - 5);
        
        // Mostrar información
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`|proj| = ${VectorOperations.magnitude(projection).toFixed(2)}`, origin.x, 30);
        
        return {
            canvas: canvas,
            vector: vector,
            onto: onto,
            projection: projection
        };
    }
    
    /**
     * Visualiza campo vectorial 2D
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Function} vectorField - Función de campo vectorial f(x, y)
     * @param {Object} options - Opciones de visualización
     */
    static visualizeVectorField(canvas, vectorField, options = {}) {
        const ctx = canvas.getContext('2d');
        const {
            gridSize = 20,
            scale = 1,
            color = '#3498db',
            showMagnitude = false
        } = options;
        
        canvas.width = 400;
        canvas.height = 400;
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Limpiar canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grid y ejes
        this.drawGrid(ctx, canvas.width, canvas.height);
        this.drawAxes(ctx, origin);
        
        // Dibujar campo vectorial
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                // Convertir a coordenadas matemáticas
                const mathX = (x - origin.x) / scale;
                const mathY = -(y - origin.y) / scale;
                
                // Evaluar campo vectorial
                const vector = vectorField(mathX, mathY);
                
                if (vector && vector.length === 2) {
                    // Escalar para visualización
                    const scaledVector = [
                        vector[0] * scale,
                        -vector[1] * scale // Invertir Y
                    ];
                    
                    // Limitar longitud para visualización
                    const magnitude = VectorOperations.magnitude(scaledVector);
                    const maxLength = gridSize * 0.8;
                    
                    if (magnitude > 0) {
                        const normalizedVector = VectorOperations.scalarMultiply(
                            scaledVector,
                            Math.min(magnitude, maxLength) / magnitude
                        );
                        
                        // Color basado en magnitud
                        const intensity = Math.min(magnitude / maxLength, 1);
                        const red = Math.floor(52 + intensity * (231 - 52));
                        const green = Math.floor(152 + intensity * (76 - 152));
                        const blue = Math.floor(219 + intensity * (60 - 219));
                        
                        this.drawVector2D(ctx, { x, y }, normalizedVector, `rgb(${red}, ${green}, ${blue})`, false);
                    }
                }
            }
        }
        
        return {
            canvas: canvas,
            vectorField: vectorField,
            gridSize: gridSize
        };
    }
    
    /**
     * Crea visualización interactiva de vectores
     * @param {HTMLCanvasElement} canvas - Canvas de destino
     * @param {Array<Array<number>>} vectors - Vectores iniciales
     * @param {Function} onVectorChange - Callback al cambiar vector
     */
    static createInteractiveVectors(canvas, vectors, onVectorChange) {
        const scale = 2;
        const origin = { x: canvas.width / 2, y: canvas.height / 2 };
        let selectedVector = null;
        let isDragging = false;
        
        // Visualización inicial
        this.visualizeVectors2D(canvas, vectors, { scale });
        
        // Event listeners
        canvas.addEventListener('mousedown', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // Verificar si se hizo clic en un vector
            for (let i = 0; i < vectors.length; i++) {
                const vector = vectors[i];
                const endX = origin.x + vector[0] * scale;
                const endY = origin.y - vector[1] * scale;
                
                const distance = Math.sqrt(
                    Math.pow(mouseX - endX, 2) + Math.pow(mouseY - endY, 2)
                );
                
                if (distance < 10) {
                    selectedVector = i;
                    isDragging = true;
                    canvas.style.cursor = 'grabbing';
                    break;
                }
            }
        });
        
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            if (isDragging && selectedVector !== null) {
                // Actualizar vector
                const newVector = [
                    (mouseX - origin.x) / scale,
                    -(mouseY - origin.y) / scale
                ];
                
                vectors[selectedVector] = newVector;
                
                // Redibujar
                this.visualizeVectors2D(canvas, vectors, { scale });
                
                // Notificar cambio
                if (onVectorChange) {
                    onVectorChange(selectedVector, newVector);
                }
            } else {
                // Verificar hover
                let hovering = false;
                for (const vector of vectors) {
                    const endX = origin.x + vector[0] * scale;
                    const endY = origin.y - vector[1] * scale;
                    
                    const distance = Math.sqrt(
                        Math.pow(mouseX - endX, 2) + Math.pow(mouseY - endY, 2)
                    );
                    
                    if (distance < 10) {
                        hovering = true;
                        canvas.style.cursor = 'grab';
                        break;
                    }
                }
                
                if (!hovering) {
                    canvas.style.cursor = 'default';
                }
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            selectedVector = null;
            canvas.style.cursor = 'default';
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            selectedVector = null;
            canvas.style.cursor = 'default';
        });
        
        return {
            canvas: canvas,
            vectors: vectors,
            updateVectors: (newVectors) => {
                vectors.length = 0;
                vectors.push(...newVectors);
                this.visualizeVectors2D(canvas, vectors, { scale });
            }
        };
    }
}
