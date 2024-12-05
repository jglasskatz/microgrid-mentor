import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ComponentInstance } from "@/lib/components";
import { Link } from "wouter";

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

  const searchProducts = async (component: ComponentInstance) => {
    // Create search criteria based on component specs
    const searchParams = {
      type: component.type,
      ...Object.entries(component.specs).reduce((acc, [key, value]) => {
        if (typeof value === 'number') {
          // Create range of ±15% for better matches
          const range = value * 0.15;
          acc[`${key}_min`] = value - range;
          acc[`${key}_max`] = value + range;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {}),
    };

    const params = new URLSearchParams(searchParams);
    const response = await fetch(`/api/products/search?${params}`);
    return response.json();
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (selectedComponent) {
          const results = await searchProducts(selectedComponent);
          setProducts(Array.isArray(results) ? results : []);
        } else {
          setProducts([]); // Clear products when no component is selected
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      }
    };

    // Only fetch products if we have a selected component
    if (selectedComponent) {
      fetchProducts();
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
                  <div className="mt-2 space-y-1">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        {' '}
                        {value}
                        {key === 'power' ? 'W' : 
                         key === 'capacity' ? 'Wh' : 
                         key === 'voltage' ? 'V' : ''}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 font-semibold">${product.price.toFixed(2)}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Show details in the panel instead of navigating
                    window.open(`/products/${product.id}`, '_blank');
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
