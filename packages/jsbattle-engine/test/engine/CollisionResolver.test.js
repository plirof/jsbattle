import assert from "assert";
import sinon from "sinon";

import CollisionResolver from "../../src/engine/CollisionResolver.js"
import BattlefieldMock from "./mock/BattlefieldMock.js";
import TankMock from "./mock/TankMock.js";
import BulletMock from "./mock/BulletMock.js";

describe('CollisionResolver', function() {

  describe('constructor', function() {

    it('should work', function() {
      let resolver = new CollisionResolver();
      assert(resolver);
    });

  });

  describe('checkTank', function() {

    it('should detect collision with a wall', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank = new TankMock();
      tank.x = 2;
      tank.y = 100;

      let result = resolver.checkTank(tank);

      assert(result === false);
      assert(tank.onWallHit.called);
    });

    it('should detect collision with an enemy', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;

      let tank2 = new TankMock();
      tank2.x = 210;
      tank2.y = 210;

      resolver.checkTank(tank1);
      let result = resolver.checkTank(tank2);

      assert(result === false);
      assert(tank2.onEnemyHit.called);
      assert(!tank2.onAllyHit.called);
    });


    it('should detect collision with an ally', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.isAlly.returns(true);

      let tank2 = new TankMock();
      tank2.x = 210;
      tank2.y = 210;
      tank2.isAlly.returns(true);

      resolver.checkTank(tank1);
      let result = resolver.checkTank(tank2);

      assert(result === false);

      assert(tank2.onEnemyHit.notCalled);
      assert(tank2.onAllyHit.called);
    });

    it('should not detect a collision on free space', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      let tank2 = new TankMock();
      tank2.x = 300;
      tank2.y = 200;

      assert(resolver.checkTank(tank1));
      assert(resolver.checkTank(tank2));
    });

  });

  describe('hitTestBullet', function() {

    it('should detect collision with a wall', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let bullet = new BulletMock(new TankMock(), 1);
      bullet.x = 2;
      bullet.y = 100;

      let result = resolver.hitTestBullet(bullet);

      assert(bullet.onWallHit.called);
      assert(result);
    });

    it('should detect collision with a tank', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let bullet = new BulletMock(new TankMock(), 1);
      bullet.x = 200;
      bullet.y = 200;

      let tank = new TankMock();
      tank.x = 200;
      tank.y = 200;
      resolver.updateTank(tank);

      let result = resolver.hitTestBullet(bullet);

      assert(bullet.onEnemyHit.called);
      assert(result);
    });

    it('should not detect a collision on free space', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let bullet = new BulletMock(new TankMock(), 1);
      bullet.x = 200;
      bullet.y = 300;

      let tank = new TankMock();
      tank.x = 200;
      tank.y = 200;
      resolver.updateTank(tank);

      let result = resolver.hitTestBullet(bullet);

      assert(!result);
    });

  });
  describe('scanWalls', function() {
    it('should detect distance to a wall', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1;

      //east
      tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 20;
      tank1.radarRange = 500;
      tank1.radarAngle = -tank1.angle;
      resolver.updateTank(tank1);
      resolver.scanWalls(tank1);
      assert(tank1.onWallSpot.calledWith(300));

      //west
      tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 20;
      tank1.radarRange = 500;
      tank1.radarAngle = -tank1.angle + 180;
      resolver.updateTank(tank1);
      resolver.scanWalls(tank1);
      assert(tank1.onWallSpot.calledWith(200));

      //north
      tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 20;
      tank1.radarRange = 500;
      tank1.radarAngle = -tank1.angle - 90;
      resolver.updateTank(tank1);
      resolver.scanWalls(tank1);
      assert(tank1.onWallSpot.calledWith(200));

      //south
      tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 20;
      tank1.radarRange = 500;
      tank1.radarAngle = -tank1.angle + 90;
      resolver.updateTank(tank1);
      resolver.scanWalls(tank1);
      assert(tank1.onWallSpot.calledWith(300));

    });
  });

  describe('scanTanks', function() {

    it('should detect an enemy', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      let tank2 = new TankMock();
      tank2.x = 400;
      tank2.y = 200;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      let result = resolver.scanTanks(tank1);

      assert(result);
      assert(tank1.onEnemySpot.calledWith(tank2));
      assert(tank2.onTargetingAlarm.called);
      assert(tank1.onAllySpot.notCalled);
    });


    it('should detect an ally', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;
      tank1.isAlly.returns(true);

      let tank2 = new TankMock();
      tank2.x = 400;
      tank2.y = 200;
      tank2.isAlly.returns(true);

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      let result = resolver.scanTanks(tank1);

      assert(result);
      assert(tank1.onAllySpot.calledWith(tank2));
      assert(tank1.onEnemySpot.notCalled);
    });


    it('should not detect a bullet', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;
      let owner = new TankMock();
      owner.x = 0;
      owner.y = 0;
      owner.angle = 0;
      owner.gunAngle = 0;

      let bullet = new BulletMock(owner, 0.3);
      bullet.x = 400;
      bullet.y = 200;

      resolver.checkTank(tank1);
      resolver.hitTestBullet(bullet);

      let result = resolver.scanTanks(tank1);

      assert(!result);
      assert(tank1.onBulletSpot.notCalled);
    });

    it('should not detect anything on free space', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      let tank2 = new TankMock();
      tank2.x = 200;
      tank2.y = 400;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      let result = resolver.scanTanks(tank1);
      assert(!result);
      assert(tank1.onEnemySpot.notCalled);
    });

  });


  describe('scanBullets', function() {

    it('should not detect an enemy', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      let tank2 = new TankMock();
      tank2.x = 400;
      tank2.y = 200;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      let result = resolver.scanBullets(tank1);

      assert(!result);
      assert(tank1.onEnemySpot.notCalled);
      assert(tank2.onTargetingAlarm.notCalled);
    });


    it('should detect a bullet', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      let bullet = new BulletMock(new TankMock(), 0.3);
      bullet.x = 400;
      bullet.y = 200;

      resolver.checkTank(tank1);
      resolver.hitTestBullet(bullet);

      let result = resolver.scanBullets(tank1);

      assert(result);
      assert(tank1.onBulletSpot.calledWith(bullet));
    });

    it('should not detect anything on free space', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      let tank2 = new TankMock();
      tank2.x = 200;
      tank2.y = 400;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      let result = resolver.scanBullets(tank1);
      assert(!result);
      assert(tank1.onEnemySpot.notCalled);
    });

  });

  describe('updateTank', function() {

    it('change position of a tank', function() {
      let resolver = new CollisionResolver();
      let battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      let tank = new TankMock();
      tank.x = 2;
      tank.y = 100;

      let result = resolver.checkTank(tank);

      assert(result === false);
      assert(tank.onWallHit.called);

      tank.x = 200;
      tank.y = 100;

      result = resolver.checkTank(tank);

      assert(result === true);

    });

  });



});
