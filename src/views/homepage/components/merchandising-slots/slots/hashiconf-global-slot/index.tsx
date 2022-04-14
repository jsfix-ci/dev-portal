import Link from 'next/link'
import Heading from 'components/heading'
import Text from 'components/text'
import s from './hashiconf-global-slot.module.css'

export default function HashiConfGlobalSlot() {
  return (
    <Link href="/">
      <a className={s.root}>
        <Heading level={2} size={500} weight="bold" slug="hcp-vault">
          HashiConf Global
        </Heading>

        <footer className={s.footer}>
          <Text className={s.description}>
            October 4-6, 2O22 (PST) <br /> Los Angeles & Virtual
          </Text>
          <Text className={s.description}>hashiconf.com</Text>
        </footer>
      </a>
    </Link>
  )
}
