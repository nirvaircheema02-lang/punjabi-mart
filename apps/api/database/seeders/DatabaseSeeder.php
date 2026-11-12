<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class DatabaseSeeder extends Seeder {
 public function run(): void {
  if(!config('commerce.demo')) { $this->command?->warn('Demo seeding is disabled. No live inventory was created.'); return; }
  foreach(json_decode(file_get_contents(__DIR__.'/data/sellers.json'),true) as $s) DB::table('shops')->insertOrIgnore(['id'=>$s['id'],'name'=>$s['name'],'city'=>$s['city'],'speciality'=>$s['speciality'],'story'=>$s['story'],'since'=>$s['since'],'status'=>'approved','created_at'=>now(),'updated_at'=>now()]);
  foreach(json_decode(file_get_contents(__DIR__.'/data/products.json'),true) as $p) DB::table('products')->insertOrIgnore(['id'=>$p['id'],'slug'=>$p['slug'],'seller_id'=>$p['sellerId'],'title'=>$p['title'],'category'=>$p['category'],'price'=>round($p['price']*100),'mrp'=>round($p['mrp']*100),'stock'=>$p['inStock']?25:0,'status'=>'active','is_demo'=>true,'details'=>json_encode($p),'created_at'=>now(),'updated_at'=>now()]);
  foreach(['checkoutEnabled'=>true,'codEnabled'=>true,'serviceablePrefixes'=>['1','2','3','4','5','6','7','8','9']] as $k=>$v)DB::table('shop_settings')->insertOrIgnore(['key'=>$k,'value'=>json_encode($v)]);
 }
}
