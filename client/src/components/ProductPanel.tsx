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

  const searchProducts = async (type: string, specs: Record<string, number | string>) => {
    // Convert specs to ranges (±10% of the target value)
    const specRanges = Object.entries(specs).reduce((acc, [key, value]) => {
      if (typeof value === 'number') {
        const range = value * 0.1;
        acc[`${key}_min`] = value - range;
        acc[`${key}_max`] = value + range;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    const params = new URLSearchParams({
      type,
      ...specRanges
    });
    const response = await fetch(`/api/products/search?${params}`);
    return response.json();
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (selectedComponent) {
          const results = await searchProducts(selectedComponent.type, selectedComponent.specs);
          setProducts(results);
        } else {
          const results = await fetch('/api/products/search').then(res => res.json());
          setProducts(results);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    window.location.href = `/products/${product.id}`;
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
