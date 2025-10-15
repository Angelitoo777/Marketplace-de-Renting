import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    title: 'Marketplace de Renting API',
    description: 'API profesional para manejo de usuarios, productos y rentas en el Marketplace de Renting',
    version: '1.0.0'
  },
  host: 'localhost:3000', // cambia a tu dominio en producción
  schemes: ['http', 'https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
    }
  },
  definitions: {
    // USERS
    User: {
      id: 'uuid',
      username: 'usuario1',
      email: 'user@example.com',
      role: ['User']
    },
    RegisterRequest: {
      username: 'usuario1',
      email: 'user@example.com',
      password: 'password123',
      roles: 2
    },
    LoginRequest: {
      username: 'usuario1',
      password: 'password123'
    },
    AuthResponse: {
      message: 'Te has logueado exitosamente'
    },

    // ROLES
    Role: {
      id: 1,
      roles: 'Admin'
    },

    // PRODUCTS
    Product: {
      id: 'uuid',
      name: 'Producto 1',
      description: 'Descripción del producto',
      pricePerDay: 100.0,
      available: true,
      owner_id: 'uuid'
    },
    ProductCreateRequest: {
      name: 'Producto 1',
      description: 'Descripción del producto',
      pricePerDay: 150.0
    },
    ProductUpdateRequest: {
      name: 'Nuevo nombre',
      pricePerDay: 120.0,
      available: true
    },

    // RENTALS
    Rental: {
      id: 'uuid',
      product_id: 'uuid',
      renter_id: 'uuid',
      startDate: '2025-10-20',
      endDate: '2025-10-25',
      totalPrice: 500,
      status_id: 1,
      payment_status: 'pending',
      payment_intent_id: 'pi_123456789'
    },
    RentalCreateRequest: {
      product_id: 'uuid',
      startDate: '2025-10-20',
      endDate: '2025-10-25'
    },
    RentalStatusUpdateRequest: {
      status_id: 2
    },

    // RENTAL STATUS
    RentalStatus: {
      id: 1,
      status: 'Pending',
      description: 'Renta pendiente de pago'
    }
  }
}

const outputFile = './swagger-output.json'
const endpointsFiles = ['./app.js']

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger profesional generado en swagger-output.json')
})
