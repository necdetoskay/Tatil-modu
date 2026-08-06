# Ontology Registry v1.0

## 1. Amaç

Travel Intelligence'ın ortak kavram sözlüğünü merkezi olarak yönetmek.

## 2. Node sınıfları

```text
entity
aspect
sub_aspect
risk
opportunity
user_context
traveler_segment
constraint
facility
activity
time_context
```

## 3. İlk üst düzey entity'ler

```text
ontology.entity.accommodation
ontology.entity.restaurant
ontology.entity.beach
ontology.entity.attraction
ontology.entity.museum
ontology.entity.park
ontology.entity.transport
ontology.entity.route
ontology.entity.event
ontology.entity.parking_area
```

## 4. İlk ortak aspect'ler

```text
ontology.aspect.cleanliness
ontology.aspect.parking
ontology.aspect.parking.availability
ontology.aspect.parking.capacity
ontology.aspect.parking.fee
ontology.aspect.parking.distance
ontology.aspect.noise
ontology.aspect.staff
ontology.aspect.accessibility
ontology.aspect.child_friendliness
ontology.aspect.waiting_time
ontology.aspect.crowd
ontology.aspect.value_for_money
ontology.aspect.safety
ontology.aspect.weather_exposure
```

## 5. Beach-specific kavramlar

```text
ontology.aspect.beach.surface
ontology.aspect.beach.water_cleanliness
ontology.aspect.beach.wave
ontology.aspect.beach.shade
ontology.aspect.beach.shower
ontology.aspect.beach.wc
ontology.aspect.beach.lifeguard
ontology.aspect.beach.access_policy
ontology.aspect.beach.access_policy.women_only
ontology.aspect.beach.child_safety
```

## 6. Accommodation-specific kavramlar

```text
ontology.aspect.room
ontology.aspect.room.size
ontology.aspect.room.bed
ontology.aspect.room.temperature
ontology.aspect.breakfast
ontology.aspect.check_in
ontology.aspect.check_out
ontology.aspect.elevator
ontology.aspect.pool
ontology.aspect.kids_area
```

## 7. Restaurant-specific kavramlar

```text
ontology.aspect.taste
ontology.aspect.hygiene
ontology.aspect.portion
ontology.aspect.price
ontology.aspect.child_menu
ontology.aspect.high_chair
ontology.aspect.dietary_option
```

## 8. Risk ontology

```text
ontology.risk.time
ontology.risk.money
ontology.risk.safety
ontology.risk.comfort
ontology.risk.accessibility
ontology.risk.child
ontology.risk.weather
ontology.risk.crowd
ontology.risk.parking
ontology.risk.health
```

## 9. Opportunity ontology

```text
ontology.opportunity.scenic
ontology.opportunity.local_food
ontology.opportunity.sunset
ontology.opportunity.short_queue
ontology.opportunity.festival
ontology.opportunity.kids_activity
ontology.opportunity.discount
ontology.opportunity.free_parking
ontology.opportunity.local_market
ontology.opportunity.hidden_gem
```

## 10. User-context ontology

```text
ontology.user.traveler.adult
ontology.user.traveler.child
ontology.user.traveler.infant
ontology.user.traveler.senior
ontology.user.mobility.stroller
ontology.user.mobility.wheelchair
ontology.user.need.nap
ontology.user.sensitivity.heat
ontology.user.sensitivity.crowd
ontology.user.tolerance.walking
ontology.user.preference.budget_flexibility
```

## 11. Relation türleri

```text
is_a
part_of
has_aspect
applies_to
conflicts_with
requires
increases_risk
reduces_risk
supports
replaced_by
alias_of
```

## 12. Hard kurallar

- Node ID benzersizdir.
- Alias canonical node yerine kalıcı kayda yazılmaz.
- `women_only` gibi access-policy kavramları basit text filtre değil kanonik ontology node olarak tutulur.
- Entity-specific aspect ortak aspect'i kopyalamaz; ilişkiyle genişletir.
- Deprecated node replacement veya migration planı taşır.
