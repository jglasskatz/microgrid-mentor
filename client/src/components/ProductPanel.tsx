import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ComponentInstance } from "@/lib/components";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
  type: string;
  specs: Record<string, number | string>;
}

interface ProductPanelProps {
  selectedComponent?: ComponentInstance | null;
}

export default function ProductPanel({ selectedComponent }: ProductPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulated product data - would typically come from an API
    const allProducts: Product[] = [
      {
        id: "1",
        name: "Solar Panel 400W",
        description: "High-efficiency monocrystalline solar panel",
        price: 299.99,
        link: "#",
        type: "solar",
        specs: { power: 400, efficiency: 0.21 },
      },
      {
        id: "2",
        name: "Solar Panel 200W",
        description: "Mid-range monocrystalline solar panel",
        price: 159.99,
        link: "#",
        type: "solar",
        specs: { power: 200, efficiency: 0.20 },
      },
      {
        id: "3",
        name: "Lithium Battery 5kWh",
        description: "Deep cycle lithium battery for energy storage",
        price: 3499.99,
        link: "#",
        type: "battery",
        specs: { capacity: 5000, voltage: 48 },
      },
      {
        id: "4",
        name: "Battery 100Ah",
        description: "12V deep cycle battery",
        price: 899.99,
        link: "#",
        type: "battery",
        specs: { capacity: 1200, voltage: 12 },
      },
      {
        id: "5",
        name: "LED Light Package",
        description: "Energy-efficient LED lighting system",
        price: 79.99,
        link: "#",
        type: "load",
        specs: { power: 60, name: "Lights" },
      },
      {
        id: "6",
        name: "Energy Star Fridge",
        description: "Energy-efficient refrigerator",
        price: 899.99,
        link: "#",
        type: "load",
        specs: { power: 500, name: "Fridge" },
      },
    ];

    // Filter products based on selected component
    if (selectedComponent) {
      const filteredProducts = allProducts.filter(product => {
        if (product.type !== selectedComponent.type) return false;
        
        // Match power specs if available
        if (selectedComponent.specs.power && product.specs.power) {
          return product.specs.power === selectedComponent.specs.power;
        }
        
        // Match battery capacity if available
        if (selectedComponent.specs.capacity && product.specs.capacity) {
          return product.specs.capacity === selectedComponent.specs.capacity;
        }
        
        return true;
      });
      
      setProducts(filteredProducts);
    } else {
      setProducts(allProducts);
    }
  }, [selectedComponent]);

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">
        {selectedComponent 
          ? `Products for ${selectedComponent.type}`
          : "Recommended Products"
        }
      </h2>
      
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
                  <div className="mt-1 text-sm text-muted-foreground">
                    {product.specs.power && `Power: ${product.specs.power}W`}
                    {product.specs.capacity && `Capacity: ${product.specs.capacity}Wh`}
                  </div>
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
