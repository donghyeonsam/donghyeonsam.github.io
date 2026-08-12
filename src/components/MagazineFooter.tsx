interface MagazineFooterProps {
  text: string
}

function MagazineFooter({ text }: MagazineFooterProps) {
  return <footer>{text}</footer>
}

export default MagazineFooter
