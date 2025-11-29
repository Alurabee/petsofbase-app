import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Heart, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pets, isLoading } = trpc.pets.list.useQuery({ limit: 100, offset: 0 });

  const filteredPets = pets?.filter((pet: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pet.name.toLowerCase().includes(query) ||
      pet.species.toLowerCase().includes(query) ||
      pet.breed?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-base-gradient-soft">
      <Navigation />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Pet Gallery</h1>
          <p className="text-muted-foreground mb-6">
            Browse all pets in the PetsOfBase community
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, species, or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPets && filteredPets.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPets.map((pet: any) => (
                <Link key={pet.id} href={`/pet/${pet.id}`}>
                  <Card className="p-4 space-y-3 hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative">
                      <img
                        src={pet.pfpImageUrl || pet.originalImageUrl}
                        alt={pet.name}
                        className="w-full aspect-square object-cover rounded-lg pet-card-border group-hover:scale-105 transition-transform"
                      />
                      {pet.nftTokenId && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          NFT #{pet.nftTokenId}
                        </Badge>
                      )}
                      {!pet.pfpImageUrl && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 left-2 bg-white/90"
                        >
                          Original
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{pet.voteCount}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary"
                      >
                        View Profile
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Pets Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "Be the first to upload a pet!"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
