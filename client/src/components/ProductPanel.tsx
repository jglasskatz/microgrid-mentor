import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
}

export default function ProductPanel() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulated product data - would typically come from an API
    setProducts([
      {
        id: "1",
        name: "Solar Panel 400W",
        description: "High-efficiency monocrystalline solar panel",
        price: 299.99,
        link: "#",
      },
      {
        id: "2",
        name: "Lithium Battery 5kWh",
        description: "Deep cycle lithium battery for energy storage",
        price: 3499.99,
        link: "#",
      },
      // Add more products as needed
    ]);
  }, []);

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Recommended Products</h2>
      
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="mt-2 font-semibold">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
