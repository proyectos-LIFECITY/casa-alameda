// ============================================================
//  CONFIGURACIÓN DEL PROYECTO — edita SOLO este archivo
//  Los valores en null se muestran en la web como "Por definir".
// ============================================================
window.ALAMEDA = {
  nombre: "Casa Alameda",

  // --- Contacto ("Obtener más información") ---
  // Número de WhatsApp en formato internacional sin "+", ej: "573001234567"
  whatsapp: null,
  // Correo de respaldo si no hay WhatsApp configurado
  email: null,

  // --- Wompi ---
  // Pega aquí tu link de pago de Wompi (Comercios > Links de pago),
  // ej: "https://checkout.wompi.co/l/AbCdEf"
  wompiLink: null,
  valorSeparacion: null,       // ej: "$2.000.000 COP"

  // --- Cifras de la inversión ---
  inversionTotal: "$645.000.000 COP",        // compra + remodelación + dotación, ej: "$1.200.000.000 COP"
  valorCompra: "$525.000.000 COP",
  valorRemodelacion: "$120.000.000 COP",
  numeroParticipaciones: 8, // ej: 60
  valorParticipacion: "$80.625.000 COP",    // ej: "$20.000.000 COP"
  rentabilidadEstimada: null,  // ej: "12% – 15% E.A. (estimada)"
  inicioOperacion: null,

  // --- Supuestos de la proyección (edítalos y la página recalcula todo) ---
  modelo: {
    tarifaNoche: 140325,            // COP por noche
    tarifaFuente: "mediana de 30 precios de Airbnb en la zona (sept. 2026)",
    ocupacion: 0.50,                // 50 % de las noches
    gastos: 0.50,                   // 50 % del ingreso bruto
    unidades: 6,
    crecimiento: 0.06,              // aumento anual de tarifas
    capRate: 0.12,                  // valor = ingreso neto anual / capRate
    costoTotal: 645000000,          // compra 525 M + remodelación 120 M
    participaciones: 8,
    cuota1: 65000000,               // primera cuota; la segunda es el resto a los 2 meses
    escenarios: [
      { nombre: "Conservador", tarifa: 112327, ocupacion: 0.35 },   // tarifa entre semana, ocupación de AirROI para Cali
      { nombre: "Base", tarifa: 140325, ocupacion: 0.50, base: true },
      { nombre: "Optimista", tarifa: 148329, ocupacion: 0.60 }      // tarifa de fin de semana
    ]
  },

  // --- Mapa (ubicación aproximada de la casa y lugares cercanos) ---
  mapa: {
    casa: [3.43328, -76.53839],
    lugares: [
      { nombre: "Galería Alameda", nota: "Plaza de mercado y turismo gastronómico", pos: [3.434608, -76.535634] },
      { nombre: "Estadio Pascual Guerrero", nota: "Fútbol, conciertos y eventos", pos: [3.429911, -76.54112] },
      { nombre: "Parque del Perro", nota: "Restaurantes y vida nocturna", pos: [3.435951, -76.545537] },
      { nombre: "Arena USC", nota: "Conciertos y eventos · Universidad Santiago de Cali", pos: [3.401672, -76.547158] }
    ]
  }        // ej: "Segundo semestre 2027"
};
