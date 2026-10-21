// Data for job.njk: one page per open job (liveJobs, from _data/jobs.json),
// with the JobPosting data Google reads. Google only reads it on a page for a single
// job, not on the list in jobs.html. A job that closes (published: false or
// past validThrough) loses its page at the next build.
const jobPosting = (job, data) => {
  const site = data.site;
  const url = `${site.url}/pages/facility/indblik/jobs/${job.id}.html`;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "JobPosting",
        title: job.title,
        description: `<p>${esc(job.summary)}</p><p>Vi forventer:</p><ul>${job.requirements.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>`,
        identifier: { "@type": "PropertyValue", name: site.name, value: job.id },
        datePosted: job.datePosted,
        ...(job.validThrough ? { validThrough: job.validThrough } : {}),
        employmentType: job.employmentType,
        hiringOrganization: { "@type": "Organization", "@id": site.url + "/#organization", name: site.legalName, sameAs: site.url, logo: site.url + "/images/logos/logo.png" },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            streetAddress: job.location.streetAddress,
            postalCode: job.location.postalCode,
            addressLocality: job.location.locality,
            addressCountry: job.location.country,
          },
        },
        directApply: false,
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: site.url + "/" },
          { "@type": "ListItem", position: 2, name: "Ledige stillinger", item: site.url + "/pages/facility/indblik/jobs.html" },
          { "@type": "ListItem", position: 3, name: job.title },
        ],
      },
    ],
  };
};

module.exports = {
  layout: "base.html",
  permalink: (data) => `/pages/facility/indblik/jobs/${data.job.id}.html`,
  eleventyComputed: {
    title: (data) => `${data.job.title}, ${({ FULL_TIME: "fuldtid", PART_TIME: "deltid" })[data.job.employmentType] || "job"} | Job hos DFMG`,
    description: (data) => data.job.summary,
    lastmod: (data) => data.job.datePosted,
    jsonLd: (data) => jobPosting(data.job, data),
  },
};
