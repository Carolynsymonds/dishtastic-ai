const TrustedBy = () => {
  const brandLogos = [
    { 
      src: "/lovable-uploads/9efe8d5f-1e81-42b0-8803-d420694c0d6d.png", 
      alt: "Papa John's",
      className: "h-4"
    },
    { 
      src: "/lovable-uploads/ec3ab3f1-fac3-42f8-80b5-c88c5a6ca92f.png", 
      alt: "Chipotle Mexican Grill",
      className: "h-8"
    },
    { 
      src: "/lovable-uploads/2e57f3ae-6eeb-4f88-8a90-a459f7dc5c67.png", 
      alt: "Chick-fil-A",
      className: "h-8"
    },
    { 
      src: "/lovable-uploads/8881ee5b-e5b5-4950-a384-bf791c2cb69a.png", 
      alt: "Applebee's",
      className: "[height:3.25rem]"
    }
  ];

  return (
    <div className="block md:hidden py-2 px-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1 font-medium">
          Trusted by Restaurateurs at
        </p>
        <div className="flex justify-around items-center gap-1 flex-wrap">
          {brandLogos.map((brand, index) => (
            <div key={index} className="flex items-center justify-around">
              <img 
                src={brand.src} 
                alt={brand.alt} 
                className={`${brand.className} max-w-full object-contain`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;