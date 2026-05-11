import fs from 'fs'
import path from 'path'

const messagesDir = '/Users/cerfbaleine/workspace/busrom-work/web/messages'
const translations = {
  ar: { title: "الصفحة غير موجودة", description: "قد تكون الصفحة التي تبحث عنها قد تمت إزالتها، أو تم تغيير اسمها، أو أنها غير متاحة مؤقتًا.", backHome: "العودة إلى الرئيسية", viewProducts: "عرض المنتجات", home: "الرئيسية", about: "من نحن", contact: "اتصل بنا" },
  da: { title: "Siden blev ikke fundet", description: "Siden, du leder efter, er muligvis blevet fjernet, har fået ændret navn eller er midlertidigt utilgængelig.", backHome: "Tilbage til forsiden", viewProducts: "Se produkter", home: "Forside", about: "Om os", contact: "Kontakt" },
  de: { title: "Seite nicht gefunden", description: "Die von Ihnen gesuchte Seite wurde möglicherweise entfernt, umbenannt oder ist vorübergehend nicht erreichbar.", backHome: "Zurück zur Startseite", viewProducts: "Produkte ansehen", home: "Startseite", about: "Über uns", contact: "Kontakt" },
  es: { title: "Página no encontrada", description: "La página que busca puede haber sido eliminada, haber cambiado de nombre o no estar disponible temporalmente.", backHome: "Volver al inicio", viewProducts: "Ver productos", home: "Inicio", about: "Nosotros", contact: "Contacto" },
  fi: { title: "Sivua ei löytynyt", description: "Etsimäsi sivu on saatettu poistaa, sen nimeä on muutettu tai se on tilapäisesti poissa käytöstä.", backHome: "Takaisin etusivulle", viewProducts: "Näytä tuotteet", home: "Etusivu", about: "Tietoa meistä", contact: "Ota yhteyttä" },
  fr: { title: "Page non trouvée", description: "La page que vous recherchez a peut-être été supprimée, a changé de nom ou est temporairement indisponible.", backHome: "Retour à l'accueil", viewProducts: "Voir les produits", home: "Accueil", about: "À propos", contact: "Contact" },
  it: { title: "Pagina non trovata", description: "La pagina che stai cercando potrebbe essere stata rimossa, aver cambiato nome o essere temporaneamente non disponibile.", backHome: "Torna alla home", viewProducts: "Visualizza prodotti", home: "Home", about: "Chi siamo", contact: "Contatti" },
  ja: { title: "ページが見つかりません", description: "お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。", backHome: "ホームに戻る", viewProducts: "製品を見る", home: "ホーム", about: "会社概要", contact: "お問い合わせ" },
  ko: { title: "페이지를 찾을 수 없습니다", description: "찾으시는 페이지가 삭제되었거나 이름이 변경되었거나 일시적으로 사용할 수 없을 수 있습니다.", backHome: "홈으로 돌아가기", viewProducts: "제품 보기", home: "홈", about: "회사 소개", contact: "문의하기" },
  nl: { title: "Pagina niet gevonden", description: "De pagina die u zoekt is mogelijk verwijderd, heeft een andere naam gekregen of is tijdelijk niet beschikbaar.", backHome: "Terug naar home", viewProducts: "Bekijk producten", home: "Home", about: "Over ons", contact: "Contact" },
  no: { title: "Siden ble ikke funnet", description: "Siden du leter etter kan ha blitt fjernet, fått endret navn eller er midlertidig utilgjengelig.", backHome: "Tilbake til forsiden", viewProducts: "Se produkter", home: "Forside", about: "Om oss", contact: "Kontakt" },
  pl: { title: "Nie znaleziono strony", description: "Strona, której szukasz, mogła zostać usunięta, jej nazwa została zmieniona lub jest tymczasowo niedostępna.", backHome: "Wróć do strony głównej", viewProducts: "Zobacz produkty", home: "Strona główna", about: "O nas", contact: "Kontakt" },
  pt: { title: "Página não encontrada", description: "A página que procura pode ter sido removida, ter mudado de nome ou estar temporariamente indisponível.", backHome: "Voltar ao início", viewProducts: "Ver produtos", home: "Início", about: "Sobre nós", contact: "Contato" },
  ru: { title: "Страница не найдена", description: "Искомая страница могла быть удалена, ее название изменено или она временно недоступна.", backHome: "Вернуться на главную", viewProducts: "Посмотреть товары", home: "Главная", about: "О нас", contact: "Контакты" },
  sv: { title: "Sidan hittades inte", description: "Sidan du letar efter kan ha tagits bort, fått sitt namn ändrat eller är tillfälligt otillgänglig.", backHome: "Tillbaka till start", viewProducts: "Visa produkter", home: "Hem", about: "Om oss", contact: "Kontakt" },
  tr: { title: "Sayfa Bulunamadı", description: "Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.", backHome: "Ana Sayfaya Dön", viewProducts: "Ürünleri Görüntüle", home: "Ana Sayfa", about: "Hakkımızda", contact: "İletişim" },
  zh: { title: "页面未找到", description: "您查找的页面可能已被删除、更名或暂时不可用。", backHome: "返回首页", viewProducts: "查看产品", home: "首页", about: "关于我们", contact: "联系我们" },
  en: { title: "Page Not Found", description: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.", backHome: "Back to Home", viewProducts: "View Products", home: "Home", about: "About Us", contact: "Contact" }
}

const files = fs.readdirSync(messagesDir)

files.forEach(file => {
  if (file.endsWith('.json')) {
    const locale = file.replace('.json', '')
    const filePath = path.join(messagesDir, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    if (translations[locale]) {
      content.notFound = translations[locale]
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8')
      console.log(`Updated ${file}`)
    }
  }
})
