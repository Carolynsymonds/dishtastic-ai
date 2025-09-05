import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/site-content";
import { staticContent } from "@/config/static-content";

const TermsConditions = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-32 px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              {staticContent.termsConditions.title}
            </h1>
            <p className="text-muted-foreground">
              {staticContent.termsConditions.lastUpdated}
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.acceptance.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.acceptance.content(siteContent.brand.name)}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.serviceDescription.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.serviceDescription.content(siteContent.brand.name)}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.userResponsibilities.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.userResponsibilities.content}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {staticContent.termsConditions.sections.userResponsibilities.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.limitationOfLiability.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.limitationOfLiability.content(siteContent.brand.name)}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.termination.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.termination.content}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.changesToTerms.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.changesToTerms.content}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{staticContent.termsConditions.sections.contactInformation.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {staticContent.termsConditions.sections.contactInformation.content(siteContent.brand.name)}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsConditions;