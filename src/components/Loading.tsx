
interface LoadingProps {
    // Tipo de loading (spinner, dots, pulse)
    variant?: 'spinner' | 'dots' | 'pulse'
    // Tamanho do loading (pequeno, médio, grande)
    size?: 'sm' | 'md' | 'lg'
    // Texto a ser mostrado abaixo do loading
    text?: string
    // Cor do loading (primária, secundária, branca)
    color?: 'primary' | 'secondary' | 'white'
    // Se deve ocupar tela inteira
    fullScreen?: boolean
    // Se deve mostrar backdrop (fundo escuro)
    hasBackdrop?: boolean
  }
  
  const Loading = ({ 
    variant = 'spinner',
    size = 'md',
    text,
    color = 'primary',
    fullScreen = false,
    hasBackdrop = false
  }: LoadingProps) => {
    // Mapeia tamanhos para classes
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    }
  
    // Mapeia cores para classes
    const colorClasses = {
      primary: 'text-primary border-primary',
      secondary: 'text-gray-600 border-gray-600',
      white: 'text-white border-white'
    }
  
    // Renderiza o spinner
    const renderSpinner = () => (
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 
          border-t-transparent 
          rounded-full 
          animate-spin 
          ${colorClasses[color]}
        `}
      />
    )
  
    // Renderiza os dots
    const renderDots = () => (
      <div className="flex space-x-1">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`
              rounded-full
              ${color === 'white' ? 'bg-white' : 'bg-primary'}
              animate-bounce
              ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'}
            `}
            style={{
              animationDelay: `${dot * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    )
  
    // Renderiza o pulse
    const renderPulse = () => (
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          ${color === 'white' ? 'bg-white' : 'bg-primary'} 
          animate-pulse
        `}
      />
    )
  
    // Seleciona o indicador de loading baseado na variante
    const renderLoader = () => {
      switch (variant) {
        case 'dots':
          return renderDots()
        case 'pulse':
          return renderPulse()
        default:
          return renderSpinner()
      }
    }
  
    // Container principal com as variações de layout
    const containerClasses = `
      flex flex-col items-center justify-center
      ${fullScreen ? 'fixed inset-0' : 'w-full h-full'}
      ${hasBackdrop ? 'bg-black/50' : ''}
      ${text ? 'gap-3' : 'gap-0'}
    `
  
    return (
      <div className={containerClasses}>
        {renderLoader()}
        {text && (
          <span className={`text-sm font-medium ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
            {text}
          </span>
        )}
      </div>
    )
  }
  
  export default Loading
  
  // Exemplos de uso:
  // const ExampleUsage = () => (
  //   <div className="space-y-4">
  //     {/* Loading básico */}
  //     <Loading />
      
  //     {/* Loading com texto */}
  //     <Loading text="Carregando..." />
      
  //     {/* Loading de tela cheia com backdrop */}
  //     <Loading 
  //       fullScreen 
  //       hasBackdrop 
  //       text="Processando sua solicitação..." 
  //       size="lg"
  //     />
      
  //     {/* Loading com dots */}
  //     <Loading variant="dots" color="primary" size="md" />
      
  //     {/* Loading com pulse em branco */}
  //     <Loading variant="pulse" color="white" size="sm" />
  //   </div>
  // )