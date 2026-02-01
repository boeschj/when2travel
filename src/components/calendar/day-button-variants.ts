import { cva } from 'class-variance-authority'

export const dayButtonVariants = cva(
  'size-10 md:size-12 flex items-center justify-center rounded-full text-sm font-medium transition-all',
  {
    variants: {
      state: {
        default: 'bg-primary/10 text-foreground hover:bg-primary/20',
        selected: 'bg-primary text-primary-foreground',
        outside: 'text-muted-foreground/50',
        disabled: 'text-muted-foreground/50 cursor-not-allowed',
      },
      emphasis: {
        true: 'font-bold shadow-[0_0_15px_rgba(70,236,19,0.4)]',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      emphasis: false,
    },
  }
)
