setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('fade-out');
    setTimeout(() => {
        preloader.style.display = 'none';
        document.getElementById('contenido').classList.remove('hidden');
    }, 1000);
}, 6000);


// 2. Función para generar reporte de productos más y menos vendidos
function generarReporteVentas() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar fuente y título
    doc.setFontSize(20);
    doc.text('Reporte de Ventas - Productos', 20, 20);

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Información general
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Día de simulación: ${diaActual}`, 20, 45);

    // Encontrar producto más vendido
    let masVendido = productos[0];
    let menosVendido = productos[0];

    productos.forEach(p => {
        if (p.ventasTotales > masVendido.ventasTotales) masVendido = p;
        if (p.ventasTotales < menosVendido.ventasTotales) menosVendido = p;
    });

    // Producto más vendido
    doc.setFontSize(16);
    doc.text('Producto Más Vendido:', 20, 60);
    doc.setFontSize(12);
    doc.text(`Nombre: ${masVendido.nombre}`, 25, 70);
    doc.text(`Categoría: ${masVendido.categoria}`, 25, 80);
    doc.text(`Cantidad vendida: ${masVendido.ventasTotales} unidades`, 25, 90);
    doc.text(`Stock actual: ${masVendido.cantidad} unidades`, 25, 100);

    // Producto menos vendido
    doc.setFontSize(16);
    doc.text('Producto Menos Vendido:', 20, 120);
    doc.setFontSize(12);
    doc.text(`Nombre: ${menosVendido.nombre}`, 25, 130);
    doc.text(`Categoría: ${menosVendido.categoria}`, 25, 140);
    doc.text(`Cantidad vendida: ${menosVendido.ventasTotales} unidades`, 25, 150);
    doc.text(`Stock actual: ${menosVendido.cantidad} unidades`, 25, 160);

    // Ranking de todos los productos
    doc.setFontSize(16);
    doc.text('Ranking Completo de Ventas:', 20, 180);

    // Ordenar productos por ventas
    const productosOrdenados = [...productos].sort((a, b) => b.ventasTotales - a.ventasTotales);

    let yPosition = 190;
    doc.setFontSize(10);
    productosOrdenados.forEach((p, index) => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.text(`${index + 1}. ${p.nombre} - ${p.ventasTotales} vendidas`, 25, yPosition);
        yPosition += 10;
    });

    // Guardar el PDF
    doc.save(`reporte-ventas-dia-${diaActual}.pdf`);
}

// 3. Función para generar reporte de pedidos/solicitudes
function generarReportePedidos() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Reporte de Pedidos y Solicitudes', 20, 20);

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Día de simulación: ${diaActual}`, 20, 45);

    // Productos que necesitan pedido
    const productosNecesitanPedido = productos.filter(p => p.cantidad < p.stockMin);

    doc.setFontSize(16);
    doc.text('Productos que Necesitan Pedido:', 20, 60);

    let yPos = 70;
    doc.setFontSize(10);

    if (productosNecesitanPedido.length === 0) {
        doc.text('No hay productos que necesiten pedido actualmente', 25, yPos);
        yPos += 20;
    } else {
        productosNecesitanPedido.forEach(p => {
            const cantidadRecomendada = Math.ceil(p.stockMin + p.consumoEstimadoPorDia * p.tiempoEntrega - p.cantidad);
            doc.text(`${p.nombre} - Stock: ${p.cantidad} | Mín: ${p.stockMin} | Recomendado: ${cantidadRecomendada}`, 25, yPos);
            yPos += 10;
        });
    }

    // Pedidos en tránsito
    const pedidosEnTransito = productos.filter(p => p.entregaEnDias > 0);

    doc.setFontSize(16);
    doc.text('Pedidos en Tránsito:', 20, yPos + 10);
    yPos += 20;

    doc.setFontSize(10);
    if (pedidosEnTransito.length === 0) {
        doc.text('No hay pedidos en tránsito', 25, yPos);
    } else {
        pedidosEnTransito.forEach(p => {
            doc.text(`${p.nombre} - Cantidad: ${p.pedidoCantidad} | Llegada en: ${p.entregaEnDias} días`, 25, yPos);
            yPos += 10;
        });
    }

    // Resumen de cantidades por categoría
    yPos += 20;
    doc.setFontSize(16);
    doc.text('Cantidades Solicitadas por Categoría:', 20, yPos);
    yPos += 10;

    const resumenCategorias = {};
    productosNecesitanPedido.forEach(p => {
        if (!resumenCategorias[p.categoria]) {
            resumenCategorias[p.categoria] = { productos: 0, cantidadTotal: 0 };
        }
        resumenCategorias[p.categoria].productos++;
        resumenCategorias[p.categoria].cantidadTotal += Math.ceil(p.stockMin + p.consumoEstimadoPorDia * p.tiempoEntrega - p.cantidad);
    });

    doc.setFontSize(10);
    Object.entries(resumenCategorias).forEach(([categoria, data]) => {
        doc.text(`${categoria}: ${data.productos} productos - ${data.cantidadTotal} unidades recomendadas`, 25, yPos);
        yPos += 10;
    });

    doc.save(`reporte-pedidos-dia-${diaActual}.pdf`);
}

// 4. Función para generar reporte de entradas y salidas
function generarReporteMovimientos() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Reporte de Entradas y Salidas', 20, 20);

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Día de simulación: ${diaActual}`, 20, 45);

    // Resumen financiero
    doc.setFontSize(16);
    doc.text('Resumen Financiero:', 20, 60);

    const capitalActual = capitalInicial + ingresos - gastos;

    doc.setFontSize(12);
    doc.text(`Capital Inicial: Bs ${capitalInicial.toFixed(2)}`, 25, 75);
    doc.text(`Total Ingresos (Ventas): Bs ${ingresos.toFixed(2)}`, 25, 85);
    doc.text(`Total Gastos (Compras): Bs ${gastos.toFixed(2)}`, 25, 95);
    doc.text(`Capital Actual: Bs ${capitalActual.toFixed(2)}`, 25, 105);
    doc.text(`Ganancia/Pérdida: Bs ${(capitalActual - capitalInicial).toFixed(2)}`, 25, 115);

    // Detalle por producto
    doc.setFontSize(16);
    doc.text('Detalle por Producto:', 20, 135);

    let yPosition = 150;
    doc.setFontSize(10);

    // Encabezados de tabla
    doc.text('Producto', 25, yPosition);
    doc.text('Vendidas', 80, yPosition);
    doc.text('Stock Actual', 120, yPosition);
    doc.text('Ingresos Est.', 160, yPosition);
    yPosition += 10;

    // Línea separadora
    doc.line(25, yPosition - 5, 190, yPosition - 5);

    productos.forEach(p => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }

        const ingresosProducto = p.ventasTotales * ((p.costoCompra + p.costoTransporte) * 1.2);

        doc.text(p.nombre, 25, yPosition);
        doc.text(p.ventasTotales.toString(), 80, yPosition);
        doc.text(p.cantidad.toString(), 120, yPosition);
        doc.text(`Bs ${ingresosProducto.toFixed(2)}`, 160, yPosition);
        yPosition += 10;
    });

    // Resumen por categoría
    if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
    }

    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Resumen por Categoría:', 20, yPosition);
    yPosition += 15;

    const resumenCat = {};
    productos.forEach(p => {
        if (!resumenCat[p.categoria]) {
            resumenCat[p.categoria] = { ventas: 0, ingresos: 0, stock: 0 };
        }
        resumenCat[p.categoria].ventas += p.ventasTotales;
        resumenCat[p.categoria].ingresos += p.ventasTotales * ((p.costoCompra + p.costoTransporte) * 1.2);
        resumenCat[p.categoria].stock += p.cantidad;
    });

    doc.setFontSize(10);
    Object.entries(resumenCat).forEach(([categoria, data]) => {
        doc.text(`${categoria}: ${data.ventas} vendidas | Bs ${data.ingresos.toFixed(2)} | Stock: ${data.stock}`, 25, yPosition);
        yPosition += 10;
    });

    doc.save(`reporte-movimientos-dia-${diaActual}.pdf`);
}

// 5. Función para generar reporte completo
function generarReporteCompleto() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Página 1: Portada
    doc.setFontSize(24);
    doc.text('REPORTE COMPLETO', 20, 40);
    doc.text('SIMULACIÓN DE INVENTARIO', 20, 60);

    doc.setFontSize(16);
    doc.text(`Día de Simulación: ${diaActual}`, 20, 100);
    doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, 20, 120);
    doc.text(`Hora: ${new Date().toLocaleTimeString()}`, 20, 140);

    // Resumen ejecutivo
    doc.setFontSize(14);
    doc.text('RESUMEN EJECUTIVO:', 20, 180);

    const masVendido = productos.reduce((max, p) => p.ventasTotales > max.ventasTotales ? p : max, productos[0]);
    const menosVendido = productos.reduce((min, p) => p.ventasTotales < min.ventasTotales ? p : min, productos[0]);
    const totalVentas = productos.reduce((sum, p) => sum + p.ventasTotales, 0);
    const productosAgotados = productos.filter(p => p.cantidad === 0).length;

    doc.setFontSize(12);
    doc.text(`• Total de productos vendidos: ${totalVentas}`, 25, 200);
    doc.text(`• Productos agotados: ${productosAgotados}`, 25, 210);
    doc.text(`• Producto estrella: ${masVendido.nombre} (${masVendido.ventasTotales} ventas)`, 25, 220);
    doc.text(`• Capital actual: Bs ${(capitalInicial + ingresos - gastos).toFixed(2)}`, 25, 230);

    // Generar las otras páginas usando las funciones existentes
    doc.addPage();

    // Aquí podrías agregar contenido adicional o llamar a las otras funciones
    // para crear un reporte más completo

    doc.save(`reporte-completo-dia-${diaActual}.pdf`);
}


let productos = [], diaActual = 0, intervalo = null, intervaloDuracion = 12000;
let capitalInicial = 10000, ingresos = 0, gastos = 0;

const proceso = document.getElementById("proceso");
const riesgosDiv = document.getElementById("riesgosDiarios");
const tablaBody = document.getElementById("tablaProductos");
const mobileContainer = document.getElementById("mobileProductos");

const nombres = ["Clavos", "Clefa", "Silicona", "Toma Corriente",
    "Prende Apaga", "Lampara", "Swich", "Foco"
];

const categorias = {
    "Luminaria": ["Foco", "Toma Corriente", "Prende Apaga", "Lampara", "Swich"],
    "Ferreteria": ["Clavos", "Clefa", "Silicona"],
};

const iconosCategoria = {
    "Luminaria": "fas fa-tools",


    "Ferreteria": "fas fa-tools",

};

const riesgos = [
    { emoji: "🌧️", efecto: "lluvia", costo: 1.1 },
    { emoji: "🚧", efecto: "bloqueo", demora: 1 },
    { emoji: "⛽", efecto: "escasez", costo: 1.2 },
    null
];

function obtenerCategoria(nombre) {
    for (const [cat, items] of Object.entries(categorias))
        if (items.includes(nombre)) return cat;
    return "Otros";
}

function generarProducto(i) {
    const nombre = nombres[i];
    return {
        id: i, nombre,
        categoria: obtenerCategoria(nombre),
        cantidad: Math.floor(Math.random() * 50) + 20,
        stockMin: Math.floor(Math.random() * 20) + 10,
        tiempoEntrega: Math.floor(Math.random() * 5) + 1,
        consumoEstimadoPorDia: Math.floor(Math.random() * 3) + 2,
        costoCompra: +(Math.random() * 10 + 5).toFixed(2),
        costoTransporte: +(Math.random() * 3 + 1).toFixed(2),
        pedidoCantidad: 0, entregaEnDias: 0,
        estado: "OK", ventasTotales: 0
    };
}

function generarEscenario() {
    productos = []; diaActual = 0; clearInterval(intervalo);
    proceso.innerHTML = ""; riesgosDiv.innerHTML = "";
    document.getElementById("rangeVelocidad").value = 12;
    document.getElementById("velocidadTexto").textContent = "12";
    capitalInicial = 100; ingresos = 0; gastos = 0; actualizarFinanzas();
    for (let i = 0; i < nombres.length; i++) productos.push(generarProducto(i));
    actualizarTabla(); actualizarMasYMenosVendidos(); actualizarResumenCategorias();
    iniciarSimulacion();
}

function actualizarTabla() {
    tablaBody.innerHTML = ""; mobileContainer.innerHTML = "";
    productos.forEach(p => {
        // Estado y cálculos
        p.estado = p.entregaEnDias > 0
            ? `🚚Entrega(${p.entregaEnDias}D)`
            : p.cantidad < p.stockMin
                ? "⚠️ ¡Pedir!"
                : "✅ Optimo";
        const totalCost = +(p.costoCompra + p.costoTransporte).toFixed(2);
        const precioVenta = +(totalCost * 1.2).toFixed(2);
        const cantRec = Math.ceil(p.stockMin + p.consumoEstimadoPorDia * p.tiempoEntrega - p.cantidad);

        // Badge
        let estadoBadge;
        if (p.estado.includes("⚠️")) {
            estadoBadge = `<span class="status-badge status-warning">${p.estado}</span>`;
        } else if (p.estado.includes("🚚")) {
            estadoBadge = `<span class="status-badge status-shipping">${p.estado}</span>`;
        } else {
            estadoBadge = `<span class="status-badge status-ok">${p.estado}</span>`;
        }

        // Fila escritorio
        const tr = document.createElement("tr");
        tr.className = "table-row";
        tr.innerHTML = `
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <i class="${iconosCategoria[p.categoria] || 'fas fa-box'} text-blue-800 mr-2"></i>
                        <div>
                            <div class="font-semibold text-slate-900">${p.nombre}</div>
                            <div class="text-xs text-gray-500">${p.categoria}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 text-center font-bold ${p.cantidad < p.stockMin ? 'text-red-600' : 'text-green-600'}">${p.cantidad}</td>
                <td class="px-4 py-3 text-center text-gray-600">${p.stockMin}</td>
                
              
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <i class=" text-blue-800 mr-2"></i>
                        <div>
                            <div class="font-semibold text-[13px] text-yellow-700">Compra ${p.costoCompra.toFixed(2)} Bs</div>
                            <div class="font-bold text-gray-700">Transporte ${p.costoTransporte.toFixed(2)} Bs</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <i class=" text-blue-800 mr-2"></i>
                        <div>
                            <div class="font-semibold text-[13px] text-slate-900">${totalCost} Bs</div>
                            <div class="font-bold text-green-700">${precioVenta} Bs</div>
                        </div>
                    </div>
                </td>

              
                <td class="px-4 py-3 text-center">${estadoBadge}</td>
                <td class="px-4 py-3 text-center">${p.estado.includes('⚠️') ? `<span class="text-blue-950 font-bold"> Ideal ${cantRec}</span>` : '—'}</td>
                <td class="px-4 py-3 text-center">${p.estado.includes('⚠️') ? `<input type="number" id="input-${p.id}" min="1" placeholder="0" class="w-16 px-2 py-1 text-slate-950 border rounded-lg text-center">` : '—'}</td>
                <td class="px-4 py-3 text-center">${p.estado.includes('⚠️') ? `<button onclick="hacerPedido(${p.id})" class="bg-slate-700 hover:bg-slate-800 text-white text-xs px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"><i class="fas fa-shopping-cart mr-1"></i>Pedir</button>` : '—'}</td>
                <td class="px-4 py-3 text-center">${p.cantidad > 0 ? `<button onclick="ventaManual(${p.id})" class="bg-green-600 hover:bg-green-900 text-white text-xs px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"><i class="fas fa-cash-register mr-1"></i>Vender</button>` : `<span class="text-gray-400">Sin stock</span>`}</td>
            `;
        tablaBody.appendChild(tr);

        // Card móvil
        const card = document.createElement("div");
        card.className = "mobile-card";
        card.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                        <i class="${iconosCategoria[p.categoria] || 'fas fa-box'} text-blue-500 mr-2 text-lg"></i>
                        <div>
                            <h3 class="font-bold text-lg">${p.nombre}</h3>
                            <span class="text-sm text-gray-500">${p.categoria}</span>
                        </div>
                    </div>
                    ${estadoBadge}
                </div>
                <div class="grid grid-cols-2 gap-4 mb-3">
                    <div class="bg-gray-50 p-2 rounded-lg">
                        <div class="text-xs text-gray-500">Stock Actual</div>
                        <div class="font-bold ${p.cantidad < p.stockMin ? 'text-red-600' : 'text-green-600'}">${p.cantidad}</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded-lg">
                        <div class="text-xs text-gray-500">Stock Mínimo</div>
                        <div class="font-bold text-gray-700">${p.stockMin}</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded-lg">
                        <div class="text-xs text-gray-500">Precio Venta</div>
                        <div class="font-bold text-green-600">$${precioVenta}</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded-lg">
                        <div class="text-xs text-gray-500">Entrega</div>
                        <div class="font-bold text-blue-600">${p.tiempoEntrega}d</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    ${p.estado.includes('⚠️') ? `
                        <div class="flex-1">
                            <input type="number" id="input-mobile-${p.id}" min="1" placeholder="Cantidad" class="w-full px-3 py-2 border rounded-lg text-center">
                        </div>
                        <button onclick="hacerPedidoMobile(${p.id})" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    `: ""}
                    ${p.cantidad > 0 ? `
                        <button onclick="ventaManual(${p.id})" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1">
                            <i class="fas fa-cash-register mr-1"></i>Vender 1
                        </button>
                    `: `<div class="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg flex-1 text-center">Sin stock</div>`}
                </div>
            `;
        mobileContainer.appendChild(card);
    });
}

function actualizarMasYMenosVendidos() {
    if (!productos.length) return;
    let mas = productos[0], menos = productos[0];
    productos.forEach(p => {
        if (p.ventasTotales > mas.ventasTotales) mas = p;
        if (p.ventasTotales < menos.ventasTotales) menos = p;
    });
    document.getElementById("masVendido").innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="${iconosCategoria[mas.categoria] || 'fas fa-box'} text-yellow-500 mr-2"></i>
                    <span class="font-bold">${mas.nombre}</span>
                </div>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    ${mas.ventasTotales} vendidas
                </span>
            </div>`;
    document.getElementById("menosVendido").innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="${iconosCategoria[menos.categoria] || 'fas fa-box'} text-red-500 mr-2"></i>
                    <span class="font-bold">${menos.nombre}</span>
                </div>
                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                    ${menos.ventasTotales} vendidas
                </span>
            </div>`;
}

function actualizarResumenCategorias() {
    const resumen = {};
    productos.forEach(p => {
        if (!resumen[p.categoria]) resumen[p.categoria] = { cnt: 0, vend: 0, stock: 0 };
        resumen[p.categoria].cnt++;
        resumen[p.categoria].vend += p.ventasTotales;
        resumen[p.categoria].stock += p.cantidad;
    });
    const cont = document.getElementById("resumenCategorias");
    cont.innerHTML = "";
    Object.entries(resumen).forEach(([cat, d]) => {
        const avg = (d.stock / d.cnt).toFixed(1);
        const card = document.createElement("div");
        card.className = "category-summary rounded-xl p-4";
        card.innerHTML = `
                <div class="flex items-center mb-2">
                    <i class="${iconosCategoria[cat] || 'fas fa-box'} text-slate-950 mr-2 text-lg"></i>
                    <h3 class="font-bold text-gray-900">${cat}</h3>
                </div>
                <div class=" flex justify-center gap-2 text-sm text-green-700">
                    <div class=" "><span>Prod:</span><span>${d.cnt}</span></div>
                    <div class=" "><span>Vend:</span><span>${d.vend}</span></div>
                    <div class=" "><span>Stock Prom:</span><span>${avg}</span></div>
                </div>`;
        cont.appendChild(card);
    });
}

function iniciarSimulacion() {
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(avanzarDia, intervaloDuracion);
}

function avanzarDia() {
    diaActual++; actualizarDia();

    // Riesgo
    const riesgo = riesgos[Math.floor(Math.random() * riesgos.length)];
    if (riesgo) {
        const rSpan = document.createElement("span");
        rSpan.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                    <span class="font-semibold">Día ${diaActual} → ${riesgo.emoji} ${riesgo.efecto.toUpperCase()}</span>
                </div>`;
        riesgosDiv.appendChild(rSpan);

        productos.forEach(p => {
            if (p.entregaEnDias > 0) {
                if (riesgo.efecto === "lluvia" || riesgo.efecto === "escasez") {
                    const inc = +(p.costoTransporte * (riesgo.costo - 1)).toFixed(2);
                    p.costoTransporte = +(p.costoTransporte * riesgo.costo).toFixed(2);
                    const det = document.createElement("span");
                    det.className = "text-xs text-orange-300 pl-4";
                    det.innerHTML = `
                            <div class="flex items-center">
                                <i class="fas fa-arrow-up mr-1"></i>
                                <span>${riesgo.emoji} ${p.nombre}: +Bs ${inc} → Bs ${p.costoTransporte.toFixed(2)}</span>
                            </div>`;
                    riesgosDiv.appendChild(det);
                }
                if (riesgo.efecto === "bloqueo") {
                    p.entregaEnDias++;
                    const det = document.createElement("span");
                    det.className = "text-xs text-red-400 pl-4";
                    det.innerHTML = `
                            <div class="flex items-center">
                                <i class="fas fa-clock mr-1"></i>
                                <span>🚧 ${p.nombre}: retraso +1d → ${p.entregaEnDias}d</span>
                            </div>`;
                    riesgosDiv.appendChild(det);
                }
            }
        });
        riesgosDiv.scrollTop = riesgosDiv.scrollHeight;
    }

    // Ventas y entregas
    productos.forEach(p => {
        if (Math.random() < 0.5 && p.cantidad > 0) {
            const v = Math.floor(Math.random() * p.cantidad) + 1;
            p.cantidad -= v; p.ventasTotales += v;
            const ingreso = v * ((p.costoCompra + p.costoTransporte) * 1.2);
            ingresos += ingreso;
            agregarEvento(`
                    <div class="flex items-center">
                        <i class="fas fa-shopping-bag text-green-400 mr-2"></i>
                        <span>${p.nombre} -${v} unidades por ${ingreso.toFixed(2)}Bs</span>
                    </div>`);
        }
        if (p.entregaEnDias > 0) {
            p.entregaEnDias--;
            if (p.entregaEnDias === 0) {
                p.cantidad += p.pedidoCantidad;
                agregarEvento(`
                        <div class="flex items-center">
                            <i class="fas fa-truck text-blue-400 mr-2"></i>
                            <span>Pedido recibido: ${p.nombre} +${p.pedidoCantidad}unidades.</span>
                        </div>`);
                p.pedidoCantidad = 0;
            }
        }
    });

    actualizarTabla(); actualizarMasYMenosVendidos();
    actualizarResumenCategorias(); actualizarFinanzas();
}

function realizarPedido(id, cantidad) {
    const p = productos.find(x => x.id === id);
    if (p.entregaEnDias > 0) { alert("Pedido en camino"); return; }
    p.pedidoCantidad = cantidad; p.entregaEnDias = p.tiempoEntrega;
    const cost = cantidad * (p.costoCompra + p.costoTransporte);
    gastos += cost;
    agregarEvento(`
            <div class="flex items-center">
                <i class="fas fa-shopping-cart text-yellow-400 mr-2"></i>
                <span>Pedido ${cantidad} unidades ${p.nombre} Bs ${cost.toFixed(2)} - ${p.tiempoEntrega}d</span>
            </div>`);
    actualizarFinanzas(); actualizarTabla();
}

function hacerPedido(id) {
    const val = parseInt(document.getElementById(`input-${id}`).value);
    if (!val || val < 1) { alert("Cantidad inválida"); return; }
    realizarPedido(id, val);
}
function hacerPedidoMobile(id) {
    const val = parseInt(document.getElementById(`input-mobile-${id}`).value);
    if (!val || val < 1) { alert("Cantidad inválida"); return; }
    realizarPedido(id, val);
}

function ventaManual(id) {
    const p = productos.find(x => x.id === id);
    if (p.cantidad < 1) { alert("Sin stock"); return; }
    p.cantidad--; p.ventasTotales++;
    const venta = (p.costoCompra + p.costoTransporte) * 1.2;
    ingresos += venta;
    agregarEvento(`
            <div class="flex items-center">
                <i class="fas fa-hand-holding-usd text-green-400 mr-2"></i>
                <span>Venta manual ${p.nombre} -1 Bs ${venta.toFixed(2)}</span>
            </div>`);
    actualizarTabla(); actualizarMasYMenosVendidos();
    actualizarResumenCategorias(); actualizarFinanzas();
}

function agregarEvento(html) {
    const span = document.createElement("span");
    span.innerHTML = `<div class="flex items-start"><span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold mr-2">Día ${diaActual}</span><div class="flex-1">${html}</div></div>`;
    proceso.appendChild(span); proceso.scrollTop = proceso.scrollHeight;
}

function actualizarFinanzas() {
    const capAct = capitalInicial + ingresos - gastos;
    document.getElementById("capitalInicial").textContent = `Bs ${capitalInicial.toFixed(2)}`;
    document.getElementById("gastosTotales").textContent = `Bs ${gastos.toFixed(2)}`;
    document.getElementById("ingresosTotales").textContent = `Bs ${ingresos.toFixed(2)}`;
    const el = document.getElementById("capitalActual");
    el.textContent = `Bs ${capAct.toFixed(2)}`;
    if (capAct < capitalInicial * 0.5) el.className = "text-xl sm:text-2xl font-bold text-red-600 mt-1 pulse-animation";
    else if (capAct > capitalInicial * 1.5) el.className = "text-xl sm:text-2xl font-bold text-green-600 mt-1";
    else el.className = "text-xl sm:text-2xl font-bold text-blue-600 mt-1";
}

function actualizarDia() {
    document.getElementById("diaActual").textContent = diaActual;
}

function reiniciarDatos() {
    clearInterval(intervalo);
    productos = []; diaActual = 0; capitalInicial = 10000; ingresos = 0; gastos = 0;
    proceso.innerHTML = ""; riesgosDiv.innerHTML = ""; tablaBody.innerHTML = ""; mobileContainer.innerHTML = "";
    document.getElementById("masVendido").innerHTML = "—";
    document.getElementById("menosVendido").innerHTML = "—";
    document.getElementById("resumenCategorias").innerHTML = "";
    actualizarDia(); actualizarTabla(); actualizarFinanzas();
    agregarEvento(`
            <div class="flex items-center">
                <i class="fas fa-refresh text-blue-400 mr-2"></i>
                <span class="font-bold text-blue-600">Sistema reiniciado correctamente</span>
            </div>`);
}

function cambiarVelocidad(v) {
    intervaloDuracion = v * 1000;
    document.getElementById("velocidadTexto").textContent = v;
    if (intervalo) { clearInterval(intervalo); iniciarSimulacion(); }
}

function iniciarSimulacion() {
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(avanzarDia, intervaloDuracion);
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';
});


function toggleReportes() {
    const panel = document.getElementById("panelReportes");
    panel.classList.toggle("hidden");
}
function togglePanelControl() {
    const panel = document.getElementById("panelControl");
    panel.classList.toggle("hidden");
}
