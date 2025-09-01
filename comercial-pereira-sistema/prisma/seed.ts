import { PrismaClient, UserRole, CustomerType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeds...')

  // Limpar dados existentes (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    await prisma.saleItem.deleteMany()
    await prisma.sale.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.product.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  }

  // 1. Criar usuários do sistema
  console.log('👥 Criando usuários...')
  const adminPassword = await bcrypt.hash('admin123', 12)
  const managerPassword = await bcrypt.hash('manager123', 12)
  const salesPassword = await bcrypt.hash('vendedor123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@comercialpereira.com' },
    update: {},
    create: {
      email: 'admin@comercialpereira.com',
      password: adminPassword,
      name: 'Administrador Sistema',
      role: UserRole.ADMIN,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'jose@comercialpereira.com' },
    update: {},
    create: {
      email: 'jose@comercialpereira.com',
      password: managerPassword,
      name: 'José Leandro Cassiano Pereira',
      role: UserRole.MANAGER,
    },
  })

  const salesperson = await prisma.user.upsert({
    where: { email: 'vendedor@comercialpereira.com' },
    update: {},
    create: {
      email: 'vendedor@comercialpereira.com',
      password: salesPassword,
      name: 'Maria Vendedora',
      role: UserRole.SALESPERSON,
    },
  })

  // 2. Criar categorias baseadas nos CNAEs da Comercial Pereira
  console.log('🏷️ Criando categorias baseadas nos CNAEs...')
  const categories = [
    { 
      name: 'Equipamentos Domésticos', 
      description: 'Eletrodomésticos e utensílios domésticos',
      cnae: '46.49-4-99'
    },
    { 
      name: 'Embalagens', 
      description: 'Caixas, sacolas e materiais de embalagem',
      cnae: '46.86-9-02'
    },
    { 
      name: 'Cosméticos e Higiene', 
      description: 'Produtos de beleza e higiene pessoal',
      cnae: '47.72-5-00'
    },
    { 
      name: 'Cama, Mesa e Banho', 
      description: 'Lençóis, toalhas e acessórios têxteis',
      cnae: '46.41-9-02'
    },
    { 
      name: 'Papelaria', 
      description: 'Artigos de escritório e papelaria',
      cnae: '46.47-8-01'
    },
    { 
      name: 'Ferragens', 
      description: 'Ferramentas e acessórios para construção',
      cnae: '46.72-9-00'
    },
    { 
      name: 'Material Elétrico', 
      description: 'Componentes e equipamentos elétricos',
      cnae: '46.73-7-00'
    },
    { 
      name: 'Armarinho', 
      description: 'Linhas, botões e acessórios de costura',
      cnae: '46.41-9-03'
    }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    createdCategories.push(created)
  }

  // 3. Criar fornecedores
  console.log('🏭 Criando fornecedores...')
  const suppliers = [
    {
      name: 'Eletro Brasil Ltda',
      contactPerson: 'João Silva',
      email: 'contato@eletrobrasil.com',
      phone: '(11) 3456-7890',
      cnpj: '12.345.678/0001-90'
    },
    {
      name: 'Embalagens SP',
      contactPerson: 'Maria Santos',
      email: 'vendas@embalagenssp.com',
      phone: '(11) 9876-5432',
      cnpj: '98.765.432/0001-10'
    }
  ]

  const createdSuppliers = []
  for (const supplier of suppliers) {
    const created = await prisma.supplier.create({
      data: supplier
    })
    createdSuppliers.push(created)
  }

  // 4. Criar produtos por categoria
  console.log('📦 Criando produtos...')
  
  // Equipamentos Domésticos
  const equipamentosCategory = createdCategories.find(c => c.name === 'Equipamentos Domésticos')!
  const equipamentosProducts = [
    { name: 'Liquidificador Industrial 2L', price: 299.99, code: 'LIQ001', quantity: 50 },
    { name: 'Panela de Pressão 10L', price: 189.90, code: 'PAN001', quantity: 30 },
    { name: 'Fritadeira Elétrica 5L', price: 450.00, code: 'FRI001', quantity: 20 },
    { name: 'Microondas 30L', price: 380.00, code: 'MIC001', quantity: 15 }
  ]

  for (const product of equipamentosProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: `${product.name} - Produto de alta qualidade para uso doméstico`,
        price: product.price,
        code: product.code,
        categoryId: equipamentosCategory.id,
        supplierId: createdSuppliers[0].id,
        inventory: {
          create: {
            quantity: product.quantity,
            minStock: 10
          }
        }
      }
    })
  }

  // Embalagens
  const embalagensCategory = createdCategories.find(c => c.name === 'Embalagens')!
  const embalagensProducts = [
    { name: 'Caixa de Papelão 30x30x30cm', price: 5.50, code: 'CX001', quantity: 500 },
    { name: 'Sacola Plástica Reforçada P', price: 0.25, code: 'SAC001', quantity: 2000 },
    { name: 'Papel Kraft 80g - Bobina', price: 45.00, code: 'PAP001', quantity: 100 },
    { name: 'Fita Adesiva Transparente', price: 8.90, code: 'FIT001', quantity: 200 }
  ]

  for (const product of embalagensProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: `${product.name} - Ideal para embalagem e transporte`,
        price: product.price,
        code: product.code,
        categoryId: embalagensCategory.id,
        supplierId: createdSuppliers[1].id,
        inventory: {
          create: {
            quantity: product.quantity,
            minStock: product.name.includes('Sacola') ? 500 : 20
          }
        }
      }
    })
  }

  // Produtos das outras categorias...
  console.log('🧴 Criando produtos de cosméticos...')
  const cosmeticosCategory = createdCategories.find(c => c.name === 'Cosméticos e Higiene')!
  const cosmeticosProducts = [
    { name: 'Shampoo Anticaspa 400ml', price: 12.90, code: 'SHA001', quantity: 150 },
    { name: 'Creme Dental Branqueador', price: 8.50, code: 'CRE001', quantity: 200 },
    { name: 'Sabonete Líquido 250ml', price: 6.75, code: 'SAB001', quantity: 300 },
  ]

  for (const product of cosmeticosProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: `${product.name} - Produto de higiene pessoal`,
        price: product.price,
        code: product.code,
        categoryId: cosmeticosCategory.id,
        inventory: {
          create: {
            quantity: product.quantity,
            minStock: 30
          }
        }
      }
    })
  }

  // 5. Criar clientes
  console.log('👥 Criando clientes...')
  const customers = [
    {
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '(11) 98765-4321',
      document: '123.456.789-00',
      type: CustomerType.RETAIL,
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP'
    },
    {
      name: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com',
      phone: '(11) 3456-7890',
      document: '12.345.678/0001-90',
      type: CustomerType.WHOLESALE,
      address: 'Av. Industrial, 456',
      city: 'São Paulo',
      state: 'SP'
    },
    {
      name: 'João Santos',
      email: 'joao@email.com',
      phone: '(11) 99999-8888',
      document: '987.654.321-00',
      type: CustomerType.RETAIL,
      address: 'Rua do Comércio, 789',
      city: 'Americana',
      state: 'SP'
    }
  ]

  for (const customer of customers) {
    await prisma.customer.create({
      data: customer
    })
  }

  console.log('✅ Seeds executados com sucesso!')
  console.log('👤 Usuários criados:')
  console.log('   - Admin: admin@comercialpereira.com / admin123')
  console.log('   - Gerente: jose@comercialpereira.com / manager123')
  console.log('   - Vendedor: vendedor@comercialpereira.com / vendedor123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seeds:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
