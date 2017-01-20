(
  function () {
    angular
    .module("multiSigWeb")
    .controller("sendTransactionCtrl", function ($scope, Wallet, Utils, Transaction, $uibModalInstance) {
      $scope.methods = [];
      $scope.tx = {
        value: 0,
        from: Wallet.coinbase
      };
      $scope.params = [];

      $scope.send = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        // if method, use contract instance method
        if ($scope.method) {
          Transaction.sendMethod(tx, $scope.abiArray, $scope.method.name, $scope.params, function (e, tx) {
            if (tx.info && tx.info.blockNumber) {
              Utils.success("Transaction was mined.");
            }
            else {
              $uibModalInstance.close();
              Utils.notification("Transaction was sent.");
            }
          });
        }
        else {
          try {
            Transaction.send(tx, function (e, tx) {
              if (e) {
                // Don't show anything, it could be a Tx Signature Rejected
                // Other errors are not managed by callback error 'e'
                // but thrown by Transaction.send() method
              }
              else if (tx.blockNumber) {
                Utils.success("Transaction was mined.");
              }
              else {
                $uibModalInstance.close();
                Utils.notification("Transaction was sent.");
              }
            });
          } catch (error) {
            Utils.dangerAlert(error);
          }
        }
      };

      $scope.signOff = function () {
        $scope.tx.value = "0x" + new Web3().toBigNumber($scope.tx.value).mul('1e18').toString(16);
        if ($scope.method) {
          Transaction.signMethodOffline($scope.tx, $scope.abiArray, $scope.method.name, $scope.params, function (e, tx) {
            $uibModalInstance.close();
            Utils.signed(tx);
          });
        }
        else{
          Transaction.signOffline($scope.tx, function (e, tx) {
            $uibModalInstance.close();
            Utils.signed(tx);
          });
        }
      };

      $scope.updateMethods = function () {
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function (item, index) {
          if (!item.constant && item.name && item.type == "function") {
            $scope.methods.push({name: item.name, index: index});
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
