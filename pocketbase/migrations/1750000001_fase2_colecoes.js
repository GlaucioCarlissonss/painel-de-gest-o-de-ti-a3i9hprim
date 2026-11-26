// Migração Fase 2 — coleções reais do Painel de Gestão de TI (Skip Cloud).
// Cria as coleções de operação (clientes, equipamentos, locacoes, chamados,
// tecnicos, filiais, titulos) e o seed idempotente com os dados que o usuário
// já validou visualmente (mocks das ondas 1 e 2).
// O seed é no-op em banco já populado (checagem por presença de registros).

migrate(
  (app) => {
    /* ------------------------------------------------------------------
     * 1. COLEÇÕES
     * ------------------------------------------------------------------ */
    // findCollectionByNameOrId LANÇA "sql: no rows in result set" quando a
    // coleção NÃO existe — essa era a causa do erro ao aplicar esta migração.
    // A checagem precisa de try/catch, nunca de retorno direto.
    const colecaoExiste = (nome) => {
      try {
        app.findCollectionByNameOrId(nome)
        return true
      } catch (e) {
        return false
      }
    }

    const criar = (nome, campos) => {
      if (colecaoExiste(nome)) return
      const col = new Collection({
        name: nome,
        type: 'base',
        // Regra "" (string vazia) = acesso público; null deixaria tudo
        // apenas para superusuários e quebraria as leituras do app.
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
        fields: campos.map((c) => (c.type === 'select' ? { maxSelect: 1, ...c } : c)),
      })
      app.save(col)
    }

    criar('clientes', [
      { name: 'nome', type: 'text', required: true },
      { name: 'segmento', type: 'text', required: true },
      { name: 'contrato', type: 'select', values: ['enterprise', 'padrao'], required: true },
      { name: 'critico', type: 'bool' },
      { name: 'contato_nome', type: 'text' },
      { name: 'contato_email', type: 'email' },
      { name: 'contato_telefone', type: 'text' },
      { name: 'perfil', type: 'select', values: ['cliente_externo'], required: true },
    ])

    criar('equipamentos', [
      { name: 'tipo', type: 'text', required: true },
      { name: 'modelo', type: 'text', required: true },
      { name: 'numero_serie', type: 'text' },
      {
        name: 'status_locacao',
        type: 'select',
        values: ['disponivel', 'locado', 'manutencao', 'encerrado'],
      },
    ])

    criar('locacoes', [
      { name: 'cliente', type: 'text', required: true },
      { name: 'equipamento', type: 'text', required: true },
      { name: 'tipoEquipamento', type: 'text', required: true },
      { name: 'dataInicio', type: 'text', required: true },
      { name: 'dataFim', type: 'text', required: true },
      {
        name: 'status',
        type: 'select',
        values: ['Ativo', 'Vencendo em 7 dias', 'Encerrado'],
        required: true,
      },
      { name: 'valorMensal', type: 'number', required: true },
    ])

    criar('tecnicos', [
      { name: 'nome', type: 'text', required: true },
      { name: 'iniciais', type: 'text', required: true },
      { name: 'nivel', type: 'select', values: ['N1', 'N2', 'Gestor'], required: true },
      {
        name: 'especialidades',
        type: 'json',
        maxSize: 200000,
      },
      { name: 'disponivel', type: 'bool' },
      {
        name: 'perfil',
        type: 'select',
        values: ['tecnico_n1', 'tecnico_n2', 'admin'],
        required: true,
      },
    ])

    criar('chamados', [
      { name: 'numero', type: 'text', required: true },
      { name: 'cliente', type: 'text', required: true },
      { name: 'equipamento', type: 'text' },
      { name: 'tipo', type: 'text', required: true },
      { name: 'prioridade', type: 'select', values: ['Alta', 'Média', 'Baixa'], required: true },
      {
        name: 'status',
        type: 'select',
        values: ['Aberto', 'Em Atendimento', 'Escalonado', 'Resolvido', 'Fechado'],
        required: true,
      },
      { name: 'aberturaISO', type: 'text', required: true },
      { name: 'slaHoras', type: 'number', required: true },
      { name: 'prazoISO', type: 'text', required: true },
      { name: 'descricao', type: 'text' },
      { name: 'tecnico', type: 'text' },
      { name: 'abertoViaPortal', type: 'bool' },
      { name: 'timeline', type: 'json', maxSize: 500000 },
    ])

    criar('filiais', [
      { name: 'nome', type: 'text', required: true },
      { name: 'cidade', type: 'text', required: true },
      { name: 'estado', type: 'text', required: true },
      { name: 'latitude', type: 'number', required: true },
      { name: 'longitude', type: 'number', required: true },
      { name: 'status', type: 'select', values: ['ok', 'risco', 'critico'], required: true },
      // Contadores podem legitimamente ser 0 — PocketBase rejeita 0 em number
      // required ("cannot be blank"), então ficam opcionais.
      { name: 'equipamentosLocados', type: 'number' },
      { name: 'chamadosAbertos', type: 'number' },
      { name: 'tecnicoResponsavel', type: 'text', required: true },
      { name: 'cliente', type: 'text', required: true },
    ])

    criar('titulos', [
      { name: 'tipo', type: 'select', values: ['pagar', 'receber'], required: true },
      { name: 'parte', type: 'text', required: true }, // fornecedor ou cliente
      { name: 'descricao', type: 'text', required: true },
      { name: 'categoria', type: 'text', required: true },
      { name: 'valor', type: 'number', required: true },
      { name: 'vencimento', type: 'text', required: true },
      { name: 'status', type: 'select', values: ['Pago', 'Pendente', 'Vencido'], required: true },
      { name: 'locacaoVinculada', type: 'text' },
      { name: 'chamadoVinculado', type: 'text' },
    ])

    /* ------------------------------------------------------------------
     * 2. SEED IDEMPOTENTE — no-op em banco já populado
     * ------------------------------------------------------------------ */
    // Seed idempotente: só insere quando a coleção está vazia.
    // Dois pontos críticos do JSVM:
    //  - findRecordsByFilter para checar se já há registros;
    //  - new Record exige a INSTÂNCIA da Collection (não o nome) — passar a
    //    string causa "nil pointer dereference".
    const seedSeVazio = (nomeColecao, registros, montar) => {
      const colecao = app.findCollectionByNameOrId(nomeColecao)
      const jaTem = app.findRecordsByFilter(nomeColecao, 'id != ""', '', 1, 0).length > 0
      if (jaTem) return
      for (const r of registros) {
        const rec = new Record(colecao)
        const dados = montar(r)
        for (const k of Object.keys(dados)) {
          rec.set(k, dados[k])
        }
        app.save(rec)
      }
    }

    // --- Clientes (os 7 validados) ---
    seedSeVazio(
      'clientes',
      [
        {
          nome: 'TechNova Sistemas',
          segmento: 'Tecnologia',
          contrato: 'enterprise',
          critico: false,
          email: 'contato@technova.com.br',
          tel: '(11) 4002-8922',
          pessoa: 'Marcos Tavares',
        },
        {
          nome: 'Clínica VitalCare',
          segmento: 'Saúde',
          contrato: 'padrao',
          critico: true,
          email: 'ti@vitalcare.com.br',
          tel: '(31) 3344-1200',
          pessoa: 'Dra. Helena Braga',
        },
        {
          nome: 'Construtora Alfa',
          segmento: 'Construção',
          contrato: 'padrao',
          critico: false,
          email: 'adm@construtoraalfa.com.br',
          tel: '(71) 3230-4545',
          pessoa: 'Eng. Paulo Andrade',
        },
        {
          nome: 'Escola Saber',
          segmento: 'Educação',
          contrato: 'padrao',
          critico: false,
          email: 'secretaria@escolasaber.edu.br',
          tel: '(41) 3025-6800',
          pessoa: 'Coord. Renata Lima',
        },
        {
          nome: 'LogTrans Express',
          segmento: 'Logística',
          contrato: 'enterprise',
          critico: true,
          email: 'noc@logtrans.com.br',
          tel: '(11) 2168-9000',
          pessoa: 'NOC LogTrans',
        },
        {
          nome: 'Advocacia Andrade',
          segmento: 'Jurídico',
          contrato: 'padrao',
          critico: false,
          email: 'ti@advandrade.com.br',
          tel: '(51) 3080-1200',
          pessoa: 'Dr. Otávio Andrade',
        },
        {
          nome: 'Varejo Max',
          segmento: 'Varejo',
          contrato: 'padrao',
          critico: false,
          email: 'suporte@varejomax.com.br',
          tel: '(21) 2555-3400',
          pessoa: 'Gerente Loja Barra',
        },
      ],
      (r) => ({
        nome: r.nome,
        segmento: r.segmento,
        contrato: r.contrato,
        critico: r.critico,
        contato_nome: r.pessoa,
        contato_email: r.email,
        contato_telefone: r.tel,
        perfil: 'cliente_externo',
      }),
    )

    // --- Técnicos (perfis de operação: N1 / N2 / admin) ---
    seedSeVazio(
      'tecnicos',
      [
        {
          nome: 'Carlos Andrade',
          iniciais: 'CA',
          nivel: 'N1',
          esp: ['Suporte N1'],
          disp: true,
          perfil: 'tecnico_n1',
        },
        {
          nome: 'Bruna Teixeira',
          iniciais: 'BT',
          nivel: 'N1',
          esp: ['Suporte N1'],
          disp: true,
          perfil: 'tecnico_n1',
        },
        {
          nome: 'Felipe Santos',
          iniciais: 'FS',
          nivel: 'N2',
          esp: ['Suporte N2', 'Dados'],
          disp: true,
          perfil: 'tecnico_n2',
        },
        {
          nome: 'Marina Costa',
          iniciais: 'MC',
          nivel: 'N2',
          esp: ['Suporte N2', 'Automação'],
          disp: true,
          perfil: 'tecnico_n2',
        },
        {
          nome: 'Rodrigo Lima',
          iniciais: 'RL',
          nivel: 'N2',
          esp: ['Implementação', 'Projeto de Infra'],
          disp: false,
          perfil: 'tecnico_n2',
        },
        {
          nome: 'Rafael Mendes',
          iniciais: 'RM',
          nivel: 'Gestor',
          esp: [],
          disp: true,
          perfil: 'admin',
        },
      ],
      (r) => ({
        nome: r.nome,
        iniciais: r.iniciais,
        nivel: r.nivel,
        especialidades: JSON.stringify(r.esp),
        disponivel: r.disp,
        perfil: r.perfil,
      }),
    )

    // --- Equipamentos (frota das locações validadas) ---
    seedSeVazio(
      'equipamentos',
      [
        {
          tipo: 'Impressora Laser',
          modelo: 'Impressora Laserjet M404',
          ns: 'HP-M404-0001',
          status: 'locado',
        },
        { tipo: 'Notebook', modelo: 'Notebook ThinkPad E14', ns: 'LENE14-0002', status: 'locado' },
        {
          tipo: 'Computador Desktop',
          modelo: 'Computador Dell OptiPlex',
          ns: 'DELOPT-0003',
          status: 'encerrado',
        },
        { tipo: 'Notebook', modelo: '10× Notebooks Acer', ns: 'ACER10-0004', status: 'locado' },
        {
          tipo: 'Impressora Térmica',
          modelo: 'Impressora térmica Zebra',
          ns: 'ZEBRA-0005',
          status: 'locado',
        },
        { tipo: 'Notebook', modelo: 'Notebook MacBook Air', ns: 'APLMBA-0006', status: 'locado' },
        {
          tipo: 'Tablet / Mobile',
          modelo: 'Tablet Samsung Tab',
          ns: 'SAMSUN-0007',
          status: 'encerrado',
        },
        {
          tipo: 'Notebook',
          modelo: 'Notebook Dell Latitude 5440',
          ns: 'DELL5440-0008',
          status: 'locado',
        },
      ],
      (r) => ({ tipo: r.tipo, modelo: r.modelo, numero_serie: r.ns, status_locacao: r.status }),
    )

    // --- Locações (as 8 validadas) ---
    seedSeVazio(
      'locacoes',
      [
        {
          cliente: 'TechNova Sistemas',
          equipamento: 'Impressora Laserjet M404',
          tipo: 'Impressora Laser',
          ini: '05/03/2025',
          fim: '05/06/2025',
          status: 'Ativo',
          valor: 480,
        },
        {
          cliente: 'Clínica VitalCare',
          equipamento: 'Notebook ThinkPad E14',
          tipo: 'Notebook',
          ini: '12/03/2025',
          fim: '13/06/2025',
          status: 'Vencendo em 7 dias',
          valor: 620,
        },
        {
          cliente: 'Construtora Alfa',
          equipamento: 'Computador Dell OptiPlex',
          tipo: 'Computador Desktop',
          ini: '20/12/2024',
          fim: '20/03/2025',
          status: 'Encerrado',
          valor: 550,
        },
        {
          cliente: 'Escola Saber',
          equipamento: '10× Notebooks Acer',
          tipo: 'Notebook',
          ini: '03/03/2025',
          fim: '03/09/2025',
          status: 'Ativo',
          valor: 3800,
        },
        {
          cliente: 'LogTrans Express',
          equipamento: 'Impressora térmica Zebra',
          tipo: 'Impressora Térmica',
          ini: '15/03/2025',
          fim: '15/06/2025',
          status: 'Vencendo em 7 dias',
          valor: 390,
        },
        {
          cliente: 'Advocacia Andrade',
          equipamento: 'Notebook MacBook Air',
          tipo: 'Notebook',
          ini: '28/02/2025',
          fim: '28/05/2025',
          status: 'Ativo',
          valor: 890,
        },
        {
          cliente: 'Varejo Max',
          equipamento: 'Tablet Samsung Tab',
          tipo: 'Tablet / Mobile',
          ini: '10/12/2024',
          fim: '10/03/2025',
          status: 'Encerrado',
          valor: 290,
        },
        {
          cliente: 'LogTrans Express',
          equipamento: 'Notebook Dell Latitude 5440',
          tipo: 'Notebook',
          ini: '10/05/2025',
          fim: '09/06/2025',
          status: 'Vencendo em 7 dias',
          valor: 640,
        },
      ],
      (r) => ({
        cliente: r.cliente,
        equipamento: r.equipamento,
        tipoEquipamento: r.tipo,
        dataInicio: r.ini,
        dataFim: r.fim,
        status: r.status,
        valorMensal: r.valor,
      }),
    )

    // --- Chamados (#CT-1042 … #CT-1035) com timeline completa ---
    const ev = (id, dataHora, autor, descricao, tipo) => ({ id, dataHora, autor, descricao, tipo })
    const t1 = [
      ev(
        't1-1',
        '2025-06-10T08:15:00',
        'Portal do Cliente',
        'Chamado aberto via portal',
        'abertura',
      ),
      ev(
        't1-2',
        '2025-06-10T08:20:00',
        'Sistema (fila inteligente)',
        'Prioridade alta definida: equipamento com locação ativa. Designado a Felipe Santos (N2, menor carga).',
        'designacao',
      ),
      ev(
        't1-3',
        '2025-06-10T08:40:00',
        'Felipe Santos',
        'Em atendimento. Replicando falha com o switch do 2º andar.',
        'atualizacao',
      ),
    ]
    const t2 = [
      ev(
        't2-1',
        '2025-06-10T07:00:00',
        'Recepção da Clínica',
        'Chamado aberto por telefone',
        'abertura',
      ),
      ev(
        't2-2',
        '2025-06-10T07:05:00',
        'Sistema (classificação automática)',
        'Cliente crítico (saúde) → prioridade alta. SLA de 4h aplicado.',
        'atualizacao',
      ),
    ]
    const t3 = [
      ev(
        't3-1',
        '2025-06-10T04:00:00',
        'Varejo Max',
        'Chamado aberto com prazo definido: 3 dias',
        'abertura',
      ),
      ev(
        't3-2',
        '2025-06-10T06:30:00',
        'Rafael Mendes',
        'Escalonado ao N2: implementação requer acesso administrativo ao servidor da loja.',
        'escalonamento',
      ),
    ]
    const t4 = [
      ev('t4-1', '2025-06-09T05:00:00', 'Coordenação Escola Saber', 'Chamado aberto', 'abertura'),
      ev(
        't4-2',
        '2025-06-09T09:10:00',
        'Sistema (fila inteligente)',
        'Designado a Marina Costa (N2, especialidade Automação).',
        'designacao',
      ),
    ]
    const t5 = [
      ev(
        't5-1',
        '2025-06-10T06:00:00',
        'LogTrans Express',
        'Chamado aberto com prazo: 7 dias',
        'abertura',
      ),
      ev(
        't5-2',
        '2025-06-10T06:01:00',
        'Sistema (classificação automática)',
        'Projeto de infraestrutura: designação manual pelo gestor.',
        'atualizacao',
      ),
    ]
    const t6 = [
      ev('t6-1', '2025-06-08T13:00:00', 'Advocacia Andrade', 'Chamado aberto', 'abertura'),
      ev(
        't6-2',
        '2025-06-08T16:45:00',
        'Carlos Andrade',
        'Certificado instalado e drivers atualizados.',
        'resolucao',
      ),
    ]
    const t7 = [
      ev('t7-1', '2025-06-05T10:00:00', 'Varejo Max', 'Chamado aberto', 'abertura'),
      ev(
        't7-2',
        '2025-06-05T14:20:00',
        'Bruna Teixeira',
        'Cache limpo e app do caixa reinstalado.',
        'resolucao',
      ),
      ev(
        't7-3',
        '2025-06-06T09:00:00',
        'Rafael Mendes',
        'Chamado fechado após validação do cliente.',
        'fechamento',
      ),
    ]
    const t8 = [
      ev('t8-1', '2025-06-10T05:30:00', 'Varejo Max', 'Chamado aberto', 'abertura'),
      ev(
        't8-2',
        '2025-06-10T05:31:00',
        'Sistema (classificação automática)',
        'Chamado repetido no mesmo equipamento em menos de 7 dias (#CT-1036) → escalonamento automático.',
        'escalonamento',
      ),
    ]
    seedSeVazio(
      'chamados',
      [
        {
          n: '#CT-1042',
          cliente: 'TechNova Sistemas',
          eq: 'Impressora Laserjet M404',
          tipo: 'Suporte N2',
          pri: 'Alta',
          st: 'Em Atendimento',
          ab: '2025-06-10T08:15:00',
          sla: 24,
          pz: '2025-06-11T08:15:00',
          desc: 'Falha intermitente na conexão de rede e compartilhamento de arquivos',
          tec: 'Felipe Santos',
          portal: true,
          tl: t1,
        },
        {
          n: '#CT-1041',
          cliente: 'Clínica VitalCare',
          eq: 'Impressora térmica Zebra',
          tipo: 'Suporte N1',
          pri: 'Alta',
          st: 'Aberto',
          ab: '2025-06-10T07:00:00',
          sla: 4,
          pz: '2025-06-10T11:00:00',
          desc: 'Impressora térmica de etiquetas do laboratório não inicializa',
          tec: 'Carlos Andrade',
          portal: false,
          tl: t2,
        },
        {
          n: '#CT-1040',
          cliente: 'Varejo Max',
          eq: 'Tablet Samsung Tab',
          tipo: 'Implementação',
          pri: 'Média',
          st: 'Escalonado',
          ab: '2025-06-10T04:00:00',
          sla: 72,
          pz: '2025-06-13T04:00:00',
          desc: 'Configuração do novo PDV e terminal de consulta',
          tec: 'Rodrigo Lima',
          portal: false,
          tl: t3,
        },
        {
          n: '#CT-1039',
          cliente: 'Escola Saber',
          eq: '10× Notebooks Acer',
          tipo: 'Automação',
          pri: 'Baixa',
          st: 'Em Atendimento',
          ab: '2025-06-09T05:00:00',
          sla: 120,
          pz: '2025-06-14T05:00:00',
          desc: 'Ajuste no script de backup automático das estações dos alunos',
          tec: 'Marina Costa',
          portal: false,
          tl: t4,
        },
        {
          n: '#CT-1038',
          cliente: 'LogTrans Express',
          eq: 'Notebook Dell Latitude 5440',
          tipo: 'Projeto de Infra',
          pri: 'Média',
          st: 'Aberto',
          ab: '2025-06-10T06:00:00',
          sla: 168,
          pz: '2025-06-17T06:00:00',
          desc: 'Mapeamento de pontos de rede adicionais para galpão 3',
          tec: null,
          portal: false,
          tl: t5,
        },
        {
          n: '#CT-1037',
          cliente: 'Advocacia Andrade',
          eq: 'Notebook MacBook Air',
          tipo: 'Suporte N1',
          pri: 'Baixa',
          st: 'Resolvido',
          ab: '2025-06-08T13:00:00',
          sla: 24,
          pz: '2025-06-09T13:00:00',
          desc: 'Instalação de certificado digital e drivers no MacBook',
          tec: 'Carlos Andrade',
          portal: false,
          tl: t6,
        },
        {
          n: '#CT-1036',
          cliente: 'Varejo Max',
          eq: 'Tablet Samsung Tab',
          tipo: 'Suporte N1',
          pri: 'Baixa',
          st: 'Fechado',
          ab: '2025-06-05T10:00:00',
          sla: 8,
          pz: '2025-06-05T18:00:00',
          desc: 'Tablet do caixa 2 travando ao emitir cupom',
          tec: 'Bruna Teixeira',
          portal: false,
          tl: t7,
        },
        {
          n: '#CT-1035',
          cliente: 'Varejo Max',
          eq: 'Tablet Samsung Tab',
          tipo: 'Suporte N1',
          pri: 'Baixa',
          st: 'Aberto',
          ab: '2025-06-10T05:30:00',
          sla: 8,
          pz: '2025-06-10T13:30:00',
          desc: 'Tablet do caixa 2 travando novamente ao emitir cupom',
          tec: null,
          portal: false,
          tl: t8,
        },
      ],
      (r) => ({
        numero: r.n,
        cliente: r.cliente,
        equipamento: r.eq ?? '',
        tipo: r.tipo,
        prioridade: r.pri,
        status: r.st,
        aberturaISO: r.ab,
        slaHoras: r.sla,
        prazoISO: r.pz,
        descricao: r.desc ?? '',
        tecnico: r.tec ?? '',
        abertoViaPortal: r.portal,
        timeline: JSON.stringify(r.tl),
      }),
    )

    // --- Filiais (as 12 do mapa validado) ---
    seedSeVazio(
      'filiais',
      [
        {
          nome: 'Matriz São Paulo — Av. Paulista',
          cidade: 'São Paulo',
          uf: 'SP',
          lat: -23.5613,
          lng: -46.6565,
          st: 'ok',
          eq: 64,
          ch: 2,
          tec: 'Felipe Santos',
          cliente: 'TechNova Sistemas',
        },
        {
          nome: 'Filial Campinas — Techno Park',
          cidade: 'Campinas',
          uf: 'SP',
          lat: -22.9071,
          lng: -47.0626,
          st: 'ok',
          eq: 38,
          ch: 1,
          tec: 'Marina N2',
          cliente: 'TechNova Sistemas',
        },
        {
          nome: 'Clínica VitalCare — Unidade Centro',
          cidade: 'Belo Horizonte',
          uf: 'MG',
          lat: -19.9167,
          lng: -43.9345,
          st: 'critico',
          eq: 21,
          ch: 4,
          tec: 'Carlos N1',
          cliente: 'Clínica VitalCare',
        },
        {
          nome: 'Centro de Distribuição LogTrans',
          cidade: 'Guarulhos',
          uf: 'SP',
          lat: -23.4543,
          lng: -46.5337,
          st: 'risco',
          eq: 45,
          ch: 3,
          tec: 'Rodrigo Lima',
          cliente: 'LogTrans Express',
        },
        {
          nome: 'Escola Saber — Unidade Jardins',
          cidade: 'Curitiba',
          uf: 'PR',
          lat: -25.4284,
          lng: -49.2733,
          st: 'ok',
          eq: 32,
          ch: 1,
          tec: 'Marina N2',
          cliente: 'Escola Saber',
        },
        {
          nome: 'Loja Varejo Max — Shopping Barra',
          cidade: 'Rio de Janeiro',
          uf: 'RJ',
          lat: -22.9068,
          lng: -43.1729,
          st: 'risco',
          eq: 18,
          ch: 2,
          tec: 'Aguardando atribuição',
          cliente: 'Varejo Max',
        },
        {
          nome: 'Construtora Alfa — Canteiro Obras',
          cidade: 'Salvador',
          uf: 'BA',
          lat: -12.9777,
          lng: -38.5016,
          st: 'ok',
          eq: 12,
          ch: 0,
          tec: '—',
          cliente: 'Construtora Alfa',
        },
        {
          nome: 'Advocacia Andrade — Escritório Principal',
          cidade: 'Porto Alegre',
          uf: 'RS',
          lat: -30.0346,
          lng: -51.2177,
          st: 'ok',
          eq: 6,
          ch: 0,
          tec: 'Carlos N1',
          cliente: 'Advocacia Andrade',
        },
        {
          nome: 'Indústria MetalTech — Planta 2',
          cidade: 'Joinville',
          uf: 'SC',
          lat: -26.3044,
          lng: -48.8456,
          st: 'critico',
          eq: 27,
          ch: 5,
          tec: 'Felipe Santos',
          cliente: 'MetalTech Indústria',
        },
        {
          nome: 'Agro Pecuária Forte — Sede',
          cidade: 'Goiânia',
          uf: 'GO',
          lat: -16.6869,
          lng: -49.2648,
          st: 'ok',
          eq: 9,
          ch: 1,
          tec: 'Rodrigo Lima',
          cliente: 'Agro Forte',
        },
        {
          nome: 'Rede Farmácias BemViver — CD Norte',
          cidade: 'Recife',
          uf: 'PE',
          lat: -8.0476,
          lng: -34.877,
          st: 'risco',
          eq: 23,
          ch: 3,
          tec: 'Marina N2',
          cliente: 'Farmácias BemViver',
        },
        {
          nome: 'Hotel Costa Atlântica — Recepção',
          cidade: 'Fortaleza',
          uf: 'CE',
          lat: -3.7319,
          lng: -38.5267,
          st: 'ok',
          eq: 14,
          ch: 1,
          tec: 'Carlos N1',
          cliente: 'Costa Atlântica Hoteis',
        },
      ],
      (r) => ({
        nome: r.nome,
        cidade: r.cidade,
        estado: r.uf,
        latitude: r.lat,
        longitude: r.lng,
        status: r.st,
        equipamentosLocados: r.eq,
        chamadosAbertos: r.ch,
        tecnicoResponsavel: r.tec,
        cliente: r.cliente,
      }),
    )

    // --- Títulos a pagar e a receber (financeiro da Onda 1) ---
    seedSeVazio(
      'titulos',
      [
        {
          tipo: 'pagar',
          parte: 'ImprimeStore Suprimentos',
          desc: 'Insumos de impressão (toner e cilindros) para frota terceirizada',
          cat: 'Insumos de impressora',
          valor: 7480,
          venc: '10/06/2025',
          st: 'Pendente',
          loc: 'LOC-0007',
        },
        {
          tipo: 'pagar',
          parte: 'TransTec Logística',
          desc: 'Frete e instalação de 12 impressoras no CD Guarulhos',
          cat: 'Logística e instalação',
          valor: 3250,
          venc: '05/06/2025',
          st: 'Vencido',
          loc: 'LOC-0012',
        },
        {
          tipo: 'pagar',
          parte: 'ManutenPro Assistência Técnica',
          desc: 'Contrato mensal de manutenção corretiva da frota',
          cat: 'Manutenção',
          valor: 5900,
          venc: '15/06/2025',
          st: 'Pendente',
        },
        {
          tipo: 'pagar',
          parte: 'Imobiliária Paulista Prime',
          desc: 'Aluguel do depósito/logística de frota',
          cat: 'Aluguel de galpão',
          valor: 12800,
          venc: '01/06/2025',
          st: 'Pago',
        },
        {
          tipo: 'pagar',
          parte: 'AlfaPeças Componentes',
          desc: 'Compra de peças para revisão de notebooks Acer (lote Escola Saber)',
          cat: 'Peças de reposição',
          valor: 4370,
          venc: '12/06/2025',
          st: 'Pendente',
          loc: 'LOC-0004',
        },
        {
          tipo: 'pagar',
          parte: 'NetLink Telecom',
          desc: 'Link dedicado de internet da matriz',
          cat: 'Infraestrutura',
          valor: 2150,
          venc: '03/06/2025',
          st: 'Vencido',
        },
        {
          tipo: 'pagar',
          parte: 'SoftLic Licenças',
          desc: 'Licenças antivírus corporativo (248 estações)',
          cat: 'Software e licenças',
          valor: 6200,
          venc: '20/06/2025',
          st: 'Pendente',
        },
        {
          tipo: 'pagar',
          parte: 'TransporteSul Fretes',
          desc: 'Transporte de 8 tablets para a loja Varejo Max (RJ)',
          cat: 'Logística e instalação',
          valor: 1180,
          venc: '28/05/2025',
          st: 'Pago',
          loc: 'LOC-0007',
        },
        {
          tipo: 'receber',
          parte: 'TechNova Sistemas',
          desc: 'Mensalidade de locação de frota (junho/2025)',
          cat: 'Mensalidade de locação',
          valor: 18400,
          venc: '10/06/2025',
          st: 'Pendente',
          loc: 'LOC-0001',
        },
        {
          tipo: 'receber',
          parte: 'Escola Saber',
          desc: 'Mensalidade do contrato de 10 notebooks Acer',
          cat: 'Mensalidade de locação',
          valor: 3800,
          venc: '05/06/2025',
          st: 'Vencido',
          loc: 'LOC-0004',
        },
        {
          tipo: 'receber',
          parte: 'Clínica VitalCare',
          desc: 'Contrato de suporte técnico dedicado (SLA 4h)',
          cat: 'Contrato de suporte',
          valor: 5600,
          venc: '15/06/2025',
          st: 'Pendente',
          ch: '#CT-1041',
        },
        {
          tipo: 'receber',
          parte: 'LogTrans Express',
          desc: 'Mensalidade de locação de impressoras térmicas + suporte',
          cat: 'Mensalidade de locação',
          valor: 3120,
          venc: '08/06/2025',
          st: 'Pendente',
          loc: 'LOC-0005',
        },
        {
          tipo: 'receber',
          parte: 'Varejo Max',
          desc: 'Locação de tablets PDV (junho/2025)',
          cat: 'Mensalidade de locação',
          valor: 1980,
          venc: '12/06/2025',
          st: 'Pendente',
          loc: 'LOC-0007',
        },
        {
          tipo: 'receber',
          parte: 'Advocacia Andrade',
          desc: 'Locação de MacBook Air + certificado digital',
          cat: 'Mensalidade de locação',
          valor: 990,
          venc: '20/05/2025',
          st: 'Vencido',
          loc: 'LOC-0006',
        },
        {
          tipo: 'receber',
          parte: 'MetalTech Indústria',
          desc: 'Projeto de infraestrutura de rede — 2ª parcela',
          cat: 'Projeto de infra',
          valor: 14500,
          venc: '25/06/2025',
          st: 'Pendente',
          ch: '#CT-1033',
        },
        {
          tipo: 'receber',
          parte: 'Agro Forte',
          desc: 'Contrato de suporte remoto N1/N2 (junho/2025)',
          cat: 'Contrato de suporte',
          valor: 2400,
          venc: '01/06/2025',
          st: 'Pago',
        },
        {
          tipo: 'receber',
          parte: 'Construtora Alfa',
          desc: 'Locação de desktops para canteiro (maio/2025)',
          cat: 'Mensalidade de locação',
          valor: 2750,
          venc: '30/05/2025',
          st: 'Pago',
          loc: 'LOC-0003',
        },
      ],
      (r) => ({
        tipo: r.tipo,
        parte: r.parte,
        descricao: r.desc,
        categoria: r.cat,
        valor: r.valor,
        vencimento: r.venc,
        status: r.st,
        locacaoVinculada: r.loc ?? '',
        chamadoVinculado: r.ch ?? '',
      }),
    )
  },
  (app) => {
    // down: nada a reverter — a reversão apagaria dados reais dos usuários
    return
  },
)
