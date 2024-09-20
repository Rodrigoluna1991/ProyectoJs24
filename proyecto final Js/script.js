async function cargarCubiertas() {
    const response = await fetch('cubiertas.json');
    if (!response.ok) {
        throw new Error('Error al cargar el archivo JSON');
    }
    return await response.json();
}

function mostrarTarjetasIndex(cubiertas) {
    const contenedorTarjetas = document.getElementById("productos-container");
    contenedorTarjetas.innerHTML = ""; 

    cubiertas.forEach(producto => {
        const nuevaCubierta = document.createElement("div");
        nuevaCubierta.className = "tarjeta-cubierta";
        nuevaCubierta.innerHTML = `
            <img src="${producto.img}" alt="${producto.marca}">
            <h3>${producto.marca}</h3>
            <p>${producto.medida}</p>
            <p>$$ ${producto.precio}</p>
            <button>Agregar al Carrito</button>
        `;

        contenedorTarjetas.appendChild(nuevaCubierta);

        const botonAgregar = nuevaCubierta.querySelector("button");
        botonAgregar.addEventListener("click", () => {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Producto agregado al carrito",
                showConfirmButton: false,
                timer: 1500
            });
            agregarCarrito(producto);
        });
    });
}

function agregarCarrito(producto) {
    let memoria = JSON.parse(localStorage.getItem("cubiertas")) || [];
    const indiceProducto = memoria.findIndex(cubierta => cubierta.id === producto.id);

    if (indiceProducto === -1) {
        const nuevoProducto = getNuevoProductoParaMemoria(producto);
        memoria.push(nuevoProducto);
    } else {
        memoria[indiceProducto].cantidad++;
    }

    localStorage.setItem("cubiertas", JSON.stringify(memoria));
    actualizarCantidadSpan(producto);
    actualizarSumaCarrito();
}

function getNuevoProductoParaMemoria(producto) {
    return {
        id: producto.id,
        medida: producto.medida,
        precio: producto.precio,
        cantidad: 1
    };
}

function actualizarCantidadSpan(producto) {
    const cantidadSpan = document.querySelector(`.sumaCuentaCarrito[data-id="${producto.id}"]`);
    if (cantidadSpan) {
        const memoria = JSON.parse(localStorage.getItem("cubiertas")) || [];
        const indiceProducto = memoria.findIndex(cubierta => cubierta.id === producto.id);

        if (indiceProducto !== -1) {
            cantidadSpan.innerText = memoria[indiceProducto].cantidad;  
        }
    } 
}

function actualizarSumaCarrito() {
    const sumaCarrito = document.getElementById("sumaCarrito");
    const productosEnCarrito = JSON.parse(localStorage.getItem("cubiertas")) || [];
    
    let totalCantidad = 0;
    productosEnCarrito.forEach(producto => {
        totalCantidad += producto.cantidad;
    });
    
    if (sumaCarrito) {
        sumaCarrito.innerText = totalCantidad;  
    }
}

function mostrarProductosEnCarrito() {
    const carritoContainer = document.getElementById("cart-container");
    carritoContainer.innerHTML = "";
    const productosEnCarrito = JSON.parse(localStorage.getItem("cubiertas")) || [];

    if (productosEnCarrito.length > 0) {
        productosEnCarrito.forEach(producto => {
            const productoDiv = document.createElement("div");
            productoDiv.innerHTML = `
                <h2>${producto.medida}</h2>
                <p>Precio: $${producto.precio}</p>
                <button class="restar" data-id="${producto.id}"> - </button>
                <span class="sumaCuentaCarrito" data-id="${producto.id}">${producto.cantidad}</span>
                <button class="sumar" data-id="${producto.id}"> + </button>
            `;
            carritoContainer.appendChild(productoDiv);

            const restarBtn = productoDiv.querySelector(".restar");
            restarBtn.addEventListener("click", () => {
                restarAlCarrito(producto);
                mostrarProductosEnCarrito(); 
            });

            const sumarBtn = productoDiv.querySelector(".sumar");
            sumarBtn.addEventListener("click", () => {
                agregarCarrito(producto);
                mostrarProductosEnCarrito(); 
            });
        });
    } else {
        carritoContainer.innerHTML = "<p>El carrito está vacío</p>";
    }

    actualizarSumaCarrito(); 
}

function restarAlCarrito(producto) {
    let memoria = JSON.parse(localStorage.getItem("cubiertas")) || [];
    const indiceProducto = memoria.findIndex(cubierta => cubierta.id === producto.id);

    if (indiceProducto !== -1) {
        memoria[indiceProducto].cantidad--;
        if (memoria[indiceProducto].cantidad === 0) {
            memoria.splice(indiceProducto, 1);
        }
        localStorage.setItem("cubiertas", JSON.stringify(memoria));
        actualizarCantidadSpan(producto);
        actualizarSumaCarrito();
    }
}

function reiniciarCarrito() {
    localStorage.removeItem("cubiertas"); 
    mostrarProductosEnCarrito(); 
    actualizarSumaCarrito(); 
    Swal.fire({
        title: "Carrito vacio",
        text: "Todos los productos han sido eliminados del carrito.",
        icon: "success"
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const comprarBtn = document.getElementById("comprarBtn");

    if (comprarBtn) {
        comprarBtn.addEventListener("click", () => {
            let memoria = JSON.parse(localStorage.getItem("cubiertas")) || [];
            let totalProductos = 0;
            let totalPrecio = 0;

            memoria.forEach(producto => {
                totalProductos += producto.cantidad;
                totalPrecio += producto.precio * producto.cantidad;
            });

            if (totalProductos === 0) {
                return; 
            }

            Swal.fire({
                title: "¿Desea realizar la compra?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "¡Sí! Comprar"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Compra finalizada",
                        text: `Has comprado ${totalProductos} productos por un total de $${totalPrecio.toFixed(2)}.`,
                        icon: "success"
                    }).then(() => {
                        reiniciarCarrito(); 
                    });
                }
            });
        });
    }

    const reiniciarBtn = document.getElementById("reiniciarBtn");
    if (reiniciarBtn) {
        reiniciarBtn.addEventListener("click", () => {
            let memoria = JSON.parse(localStorage.getItem("cubiertas")) || [];
            
            if (memoria.length === 0) {
                Swal.fire({
                    title: "El carrito está vacío",
                    icon: "info",
                    text: "No hay productos en el carrito para reiniciar.",
                });
            } else {
                reiniciarCarrito(); 
            }
        });
    }

    const path = document.location.pathname;
    if (path.includes("index.html")) {
        const cubiertas = await cargarCubiertas();
        mostrarTarjetasIndex(cubiertas);
    } else if (path.includes("carrito.html")) {
        mostrarProductosEnCarrito();
    }

    actualizarSumaCarrito();
});

function reiniciarCarrito() {
    localStorage.removeItem("cubiertas"); 
    mostrarProductosEnCarrito(); 
    actualizarSumaCarrito(); 
    Swal.fire({
        title: "Carrito reiniciado",
        text: "Todos los productos han sido eliminados del carrito.",
        icon: "success"
    });
}



