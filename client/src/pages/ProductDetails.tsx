import { useParams } from "wouter";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetails() {
  const params = useParams();
  const { data: product } = useSWR(`/products/${params.id}`);
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Designer
        </Link>
      </Button>
      
      <div className="grid grid-cols-2 gap-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">{product?.name}</h1>
          <div className="space-y-4">
            {Object.entries(product?.specs || {}).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <dt className="font-medium capitalize">{key.replace('_', ' ')}</dt>
                <dd className="text-muted-foreground">{value}</dd>
              </div>
            ))}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Price</h3>
              <p className="text-2xl font-bold">${product?.price.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Alternative Options</h2>
          <div className="space-y-4">
            {product?.alternatives?.map((alt) => (
              <Card key={alt.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{alt.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {alt.description}
                    </p>
                    <p className="mt-2 font-semibold">
                      ${alt.price.toFixed(2)}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/products/${alt.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
