// Variables globales
let viewer = null;
let modeler = null;
let currentMode = 'view'; // 'view' o 'edit'
let currentXML = '';

// ===========================
// CORRECCIÓN DEL ERROR
// ===========================
// Obtener el XML desde el HTML y limpiarlo correctamente
function getInitialBPMN() {
    const scriptElement = document.getElementById('bpmnDiagram');
    if (!scriptElement) {
        console.error('❌ No se encontró el elemento con id "bpmnDiagram"');
        return '';
    }
    
    // Obtener el contenido y limpiar espacios en blanco
    let content = scriptElement.textContent || scriptElement.innerText;
    
    // Eliminar espacios en blanco al inicio y final
    content = content.trim();
    
    // Verificar que el contenido comience con <?xml
    if (!content.startsWith('<?xml')) {
        console.error('❌ El contenido no parece ser XML válido');
        console.log('Contenido recibido:', content.substring(0, 100));
    }
    
    return content;
}

// ======================
// FUNCIONES AUXILIARES
// ======================

function updateStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
}

function getCurrentInstance() {
    return currentMode === 'view' ? viewer : modeler;
}

function getCanvas() {
    const instance = getCurrentInstance();
    return instance ? instance.get('canvas') : null;
}

// ======================
// INICIALIZACIÓN
// ======================

function initViewer() {
    console.log('🔍 Iniciando carga del diagrama BPMN...');
    
    if (typeof BpmnJS === 'undefined') {
        console.error('❌ BpmnJS no está cargado');
        updateStatus('Error: Librería BPMN no cargada. Verifica tu conexión a internet.', 'error');
        return;
    }
    
    try {
        // Crear instancia del visor
        viewer = new BpmnJS({
            container: '#canvas',
            width: '100%',
            height: '100%'
        });

        console.log('✅ Visor BPMN creado');
        
        // Obtener el XML inicial
        const initialXML = getInitialBPMN();
        
        if (!initialXML) {
            updateStatus('Error: No se pudo cargar el diagrama BPMN', 'error');
            return;
        }
        
        console.log('📄 XML obtenido, longitud:', initialXML.length);
        loadDiagram(initialXML);
        
    } catch (err) {
        console.error('❌ Error al crear el visor:', err);
        updateStatus('Error al inicializar el visor: ' + err.message, 'error');
    }
}

function initModeler() {
    console.log('🔧 Inicializando editor BPMN...');
    
    if (typeof BpmnJS === 'undefined') {
        console.error('❌ BpmnJS Modeler no está cargado');
        updateStatus('Error: Editor BPMN no disponible.', 'error');
        return;
    }
    
    try {
        // Crear instancia del modeler
        modeler = new BpmnJS({
            container: '#canvas',
            width: '100%',
            height: '100%',
            keyboard: {
                bindTo: document
            }
        });

        console.log('✅ Editor BPMN creado');
        loadDiagram(currentXML || getInitialBPMN());
        
    } catch (err) {
        console.error('❌ Error al crear el editor:', err);
        updateStatus('Error al inicializar el editor: ' + err.message, 'error');
    }
}

function loadDiagram(xml) {
    const instance = getCurrentInstance();
    
    if (!instance) {
        console.error('❌ No hay instancia disponible');
        return;
    }

    console.log('📥 Importando diagrama...');

    instance.importXML(xml)
        .then(function(result) {
            const { warnings } = result;
            
            if (warnings.length) {
                console.warn('⚠️ Advertencias:', warnings);
            }
            
            console.log('✅ Diagrama BPMN importado exitosamente');
            
            const canvas = getCanvas();
            if (canvas) {
                canvas.zoom('fit-viewport');
            }
            
            currentXML = xml;
            updateStatus('✅ Diagrama cargado correctamente', 'success');
            
        })
        .catch(function(err) {
            console.error('❌ Error al importar XML:', err);
            console.error('Detalles del error:', err.message);
            updateStatus('Error al cargar el diagrama: ' + err.message, 'error');
        });
}

// ======================
// CONTROLES DE ZOOM
// ======================

function zoomIn() {
    const canvas = getCanvas();
    if (canvas) {
        const currentZoom = canvas.zoom();
        canvas.zoom(currentZoom + 0.1);
    }
}

function zoomOut() {
    const canvas = getCanvas();
    if (canvas) {
        const currentZoom = canvas.zoom();
        canvas.zoom(currentZoom - 0.1);
    }
}

function zoomFit() {
    const canvas = getCanvas();
    if (canvas) {
        canvas.zoom('fit-viewport');
    }
}

// ======================
// CAMBIO DE MODO
// ======================

function toggleMode() {
    if (currentMode === 'view') {
        switchToEditMode();
    } else {
        switchToViewMode();
    }
}

function switchToEditMode() {
    console.log('🔧 Cambiando a modo edición...');
    
    // Guardar el XML actual
    if (viewer) {
        viewer.saveXML({ format: true }).then(result => {
            currentXML = result.xml;
            
            // Destruir el visor
            viewer.destroy();
            viewer = null;
            
            // Inicializar el modeler
            initModeler();
            
            // Actualizar UI
            currentMode = 'edit';
            updateModeIndicator();
            document.getElementById('editorTools').classList.add('visible');
            updateStatus('✏️ Modo edición activado', 'success');
        });
    } else {
        initModeler();
        currentMode = 'edit';
        updateModeIndicator();
        document.getElementById('editorTools').classList.add('visible');
    }
}

function switchToViewMode() {
    console.log('👁️ Cambiando a modo visualización...');
    
    // Guardar el XML actual
    if (modeler) {
        modeler.saveXML({ format: true }).then(result => {
            currentXML = result.xml;
            
            // Destruir el modeler
            modeler.destroy();
            modeler = null;
            
            // Inicializar el visor
            initViewer();
            
            // Actualizar UI
            currentMode = 'view';
            updateModeIndicator();
            document.getElementById('editorTools').classList.remove('visible');
            updateStatus('👁️ Modo visualización activado', 'success');
        });
    } else {
        initViewer();
        currentMode = 'view';
        updateModeIndicator();
        document.getElementById('editorTools').classList.remove('visible');
    }
}

function updateModeIndicator() {
    const indicator = document.getElementById('modeIndicator');
    const btnToggle = document.getElementById('btnToggleMode');
    
    if (currentMode === 'edit') {
        indicator.className = 'mode-indicator mode-edit';
        indicator.innerHTML = '<i class="fas fa-edit"></i> Modo Edición';
        btnToggle.innerHTML = '<i class="fas fa-eye"></i> Modo Visualización';
    } else {
        indicator.className = 'mode-indicator mode-view';
        indicator.innerHTML = '<i class="fas fa-eye"></i> Modo Visualización';
        btnToggle.innerHTML = '<i class="fas fa-edit"></i> Modo Edición';
    }
}

// ======================
// MODAL XML
// ======================

function openXMLModal() {
    const instance = getCurrentInstance();
    if (!instance) return;
    
    instance.saveXML({ format: true }).then(result => {
        document.getElementById('xmlEditor').value = result.xml;
        document.getElementById('xmlModal').style.display = 'block';
    }).catch(err => {
        console.error('Error al obtener XML:', err);
        updateStatus('Error al obtener XML', 'error');
    });
}

function closeXMLModal() {
    document.getElementById('xmlModal').style.display = 'none';
}

function applyXMLChanges() {
    const newXML = document.getElementById('xmlEditor').value;
    
    try {
        loadDiagram(newXML);
        closeXMLModal();
        updateStatus('✅ Cambios aplicados correctamente', 'success');
    } catch (err) {
        updateStatus('Error al aplicar cambios: ' + err.message, 'error');
    }
}

function copyXMLToClipboard() {
    const xmlText = document.getElementById('xmlEditor').value;
    navigator.clipboard.writeText(xmlText).then(() => {
        updateStatus('✅ XML copiado al portapapeles', 'success');
        setTimeout(() => {
            updateStatus('', '');
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        updateStatus('Error al copiar XML', 'error');
    });
}

// ======================
// EXPORTACIÓN
// ======================

function exportSVG() {
    const instance = getCurrentInstance();
    if (!instance) return;
    
    instance.saveSVG().then(result => {
        const svg = result.svg;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        downloadFile(blob, 'diagrama-bpmn.svg');
        updateStatus('✅ SVG exportado correctamente', 'success');
    }).catch(err => {
        console.error('Error al exportar SVG:', err);
        updateStatus('Error al exportar SVG', 'error');
    });
}

function exportPNG() {
    const instance = getCurrentInstance();
    if (!instance) return;
    
    instance.saveSVG().then(result => {
        const svg = result.svg;
        
        // Crear un canvas para convertir SVG a PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(blob => {
                downloadFile(blob, 'diagrama-bpmn.png');
                updateStatus('✅ PNG exportado correctamente', 'success');
            });
        };
        
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
    }).catch(err => {
        console.error('Error al exportar PNG:', err);
        updateStatus('Error al exportar PNG', 'error');
    });
}

function exportXML() {
    const instance = getCurrentInstance();
    if (!instance) return;
    
    instance.saveXML({ format: true }).then(result => {
        const xml = result.xml;
        const blob = new Blob([xml], { type: 'application/xml' });
        downloadFile(blob, 'diagrama-bpmn.bpmn');
        updateStatus('✅ XML exportado correctamente', 'success');
    }).catch(err => {
        console.error('Error al exportar XML:', err);
        updateStatus('Error al exportar XML', 'error');
    });
}

function downloadFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ======================
// CARGAR ARCHIVO
// ======================

function loadFile() {
    document.getElementById('fileInput').click();
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const xml = e.target.result;
        loadDiagram(xml);
        updateStatus('✅ Archivo cargado correctamente', 'success');
    };
    reader.onerror = function() {
        updateStatus('Error al leer el archivo', 'error');
    };
    reader.readAsText(file);
}

// ======================
// FUNCIONES DE EDICIÓN
// ======================

function undo() {
    if (currentMode !== 'edit' || !modeler) return;
    
    const commandStack = modeler.get('commandStack');
    if (commandStack.canUndo()) {
        commandStack.undo();
        updateStatus('↶ Deshacer', 'success');
        setTimeout(() => updateStatus('', ''), 1500);
    }
}

function redo() {
    if (currentMode !== 'edit' || !modeler) return;
    
    const commandStack = modeler.get('commandStack');
    if (commandStack.canRedo()) {
        commandStack.redo();
        updateStatus('↷ Rehacer', 'success');
        setTimeout(() => updateStatus('', ''), 1500);
    }
}

function deleteSelected() {
    if (currentMode !== 'edit' || !modeler) return;
    
    const selection = modeler.get('selection');
    const modeling = modeler.get('modeling');
    
    const selectedElements = selection.get();
    if (selectedElements.length > 0) {
        modeling.removeElements(selectedElements);
        updateStatus('🗑️ Elemento(s) eliminado(s)', 'success');
        setTimeout(() => updateStatus('', ''), 1500);
    }
}

// ======================
// ATAJOS DE TECLADO
// ======================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + E: Cambiar modo
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            toggleMode();
        }
        
        // Ctrl/Cmd + X: Ver XML
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
            e.preventDefault();
            openXMLModal();
        }
        
        // Ctrl/Cmd + +: Zoom In
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            zoomIn();
        }
        
        // Ctrl/Cmd + -: Zoom Out
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomOut();
        }
        
        // Ctrl/Cmd + 0: Zoom Fit
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            zoomFit();
        }
        
        // Modo edición atajos
        if (currentMode === 'edit') {
            // Ctrl/Cmd + Z: Deshacer
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            
            // Ctrl/Cmd + Y o Ctrl/Cmd + Shift + Z: Rehacer
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
            
            // Delete: Eliminar seleccionado
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelected();
            }
        }
        
        // ESC: Cerrar modal
        if (e.key === 'Escape') {
            closeXMLModal();
        }
    });
}

// ======================
// EVENT LISTENERS
// ======================

function setupEventListeners() {
    // Zoom
    document.getElementById('btnZoomIn').addEventListener('click', zoomIn);
    document.getElementById('btnZoomOut').addEventListener('click', zoomOut);
    document.getElementById('btnZoomFit').addEventListener('click', zoomFit);
    
    // Modo
    document.getElementById('btnToggleMode').addEventListener('click', toggleMode);
    
    // XML Modal
    document.getElementById('btnViewXML').addEventListener('click', openXMLModal);
    document.getElementById('closeModal').addEventListener('click', closeXMLModal);
    document.getElementById('btnApplyXML').addEventListener('click', applyXMLChanges);
    document.getElementById('btnCopyXML').addEventListener('click', copyXMLToClipboard);
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('xmlModal');
        if (e.target === modal) {
            closeXMLModal();
        }
    });
    
    // Exportación
    document.getElementById('btnExportSVG').addEventListener('click', exportSVG);
    document.getElementById('btnExportPNG').addEventListener('click', exportPNG);
    document.getElementById('btnExportXML').addEventListener('click', exportXML);
    
    // Cargar archivo
    document.getElementById('btnLoadFile').addEventListener('click', loadFile);
    document.getElementById('fileInput').addEventListener('change', handleFileLoad);
    
    // Herramientas de edición
    document.getElementById('btnUndo').addEventListener('click', undo);
    document.getElementById('btnRedo').addEventListener('click', redo);
    document.getElementById('btnDeleteSelected').addEventListener('click', deleteSelected);
}

// ======================
// INICIALIZACIÓN PRINCIPAL
// ======================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM cargado, esperando librerías...');
        setTimeout(function() {
            initViewer();
            setupEventListeners();
            setupKeyboardShortcuts();
        }, 100);
    });
} else {
    console.log('📄 DOM ya estaba listo, iniciando...');
    setTimeout(function() {
        initViewer();
        setupEventListeners();
        setupKeyboardShortcuts();
    }, 100);
}