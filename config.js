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
    rentaConsultorio: 1600000,      // COP/mes por consultorio (escenario medio del estudio de mercado)
    rentaFuente: "comparables de El Cedro y San Fernando (oct. 2026)",
    rentaLocal: 1600000,            // COP/mes, local de ~50 m² a ~32.000/m²
    localFuente: "≈50 m² a $32.000/m², comparables cerca de la Galería",
    unidades: 6,                    // consultorios
    gastos: 0.20,                   // vacancia + gastos (15–25 % según el estudio)
    crecimiento: 0.06,              // aumento anual del arriendo
    capRate: 0.12,                  // valor = ingreso neto anual / capRate
    costoTotal: 645000000,          // compra 525 M + remodelación 120 M
    participaciones: 8,
    cuota1: 65000000,               // primera cuota; la segunda es el resto a los 2 meses
    escenarios: [
      { nombre: "Conservador", rentaConsultorio: 1200000, rentaLocal: 1250000 },
      { nombre: "Medio", rentaConsultorio: 1600000, rentaLocal: 1600000, base: true },
      { nombre: "Optimista", rentaConsultorio: 2000000, rentaLocal: 2000000 }
    ]
  },

  // --- Mapa (ubicación aproximada de la casa y lugares cercanos) ---
  mapa: {
    casa: [3.43328, -76.53839],
    lugares: [
      { nombre: "Galería Alameda", nota: "Plaza de mercado del barrio", pos: [3.434608, -76.535634] },
      { nombre: "Estadio Pascual Guerrero", nota: "Fútbol, conciertos y eventos", pos: [3.429911, -76.54112] },
      { nombre: "Clínica Rey David", nota: "Clínica general · magisterio y pensionados", pos: [3.427267, -76.538518] },
      { nombre: "Hospital Universitario del Valle", nota: "Hospital departamental · Calle 5 #36-08", pos: [3.430183, -76.54544] },
      { nombre: "Parque del Perro", nota: "Restaurantes y vida nocturna", pos: [3.435951, -76.545537] },
      { nombre: "Clínica Imbanaco", nota: "Principal clínica privada de Cali · Cra 38A #5A-100", pos: [3.423707, -76.543989] },
      { nombre: "Arena USC", nota: "Conciertos y eventos · Universidad Santiago de Cali", pos: [3.401672, -76.547158] }
    ]
  }
};
