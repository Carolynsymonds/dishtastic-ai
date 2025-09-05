import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/site-content";
import { staticContent } from "@/config/static-content";

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-32 px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              {staticContent.privacyPolicy.title}
            </h1>
            <p className="text-muted-foreground">
              {staticContent.privacyPolicy.lastUpdated}
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.privacyPolicy.sections.informationWeCollect.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.privacyPolicy.sections.informationWeCollect.content}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.privacyPolicy.sections.howWeUseInformation.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.privacyPolicy.sections.howWeUseInformation.content}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {staticContent.privacyPolicy.sections.howWeUseInformation.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.privacyPolicy.sections.informationSharing.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.privacyPolicy.sections.informationSharing.content}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.privacyPolicy.sections.dataSecurity.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.privacyPolicy.sections.dataSecurity.content}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.privacyPolicy.sections.contactUs.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.privacyPolicy.sections.contactUs.content(siteContent.brand.name)}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;