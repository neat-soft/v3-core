import { ethers } from 'hardhat'
import { FullMathTest } from '../typechain/FullMathTest'
import { expect } from './shared/expect'

const { BigNumber } = ethers
const Q128 = BigNumber.from(2).pow(128)

describe('FullMath', () => {
  let fullMath: FullMathTest
  before('deploy FullMathTest', async () => {
    const factory = await ethers.getContractFactory('FullMathTest')
    fullMath = (await factory.deploy()) as FullMathTest
  })

  describe('#mulDiv', () => {
    it('reverts if denominator is 0', async () => {
      await expect(fullMath.mulDiv(Q128, 5, 0)).to.be.revertedWith('')
    })

    it('reverts if output overflows uint256', async () => {
      await expect(fullMath.mulDiv(Q128, Q128, 1)).to.be.revertedWith('')
    })

    it('accurate without phantom overflow', async () => {
      const result = Q128.div(3)
      expect(
        await fullMath.mulDiv(
          Q128,
          /*0.5=*/ BigNumber.from(50).mul(Q128).div(100),
          /*1.5=*/ BigNumber.from(150).mul(Q128).div(100)
        )
      ).to.eq(result)
    })

    it('accurate with phantom overflow', async () => {
      const result = BigNumber.from(4375).mul(Q128).div(1000)
      expect(await fullMath.mulDiv(Q128, BigNumber.from(35).mul(Q128), BigNumber.from(8).mul(Q128))).to.eq(result)
    })

    it('accurate with phantom overflow and repeating decimal', async () => {
      const result = BigNumber.from(1).mul(Q128).div(3)
      expect(await fullMath.mulDiv(Q128, BigNumber.from(1000).mul(Q128), BigNumber.from(3000).mul(Q128))).to.eq(result)
    })
  })
  describe('#mulDivRoundingUp', () => {
    it('reverts if denominator is 0', async () => {
      await expect(fullMath.mulDivRoundingUp(Q128, 5, 0)).to.be.revertedWith('')
    })
    it('reverts if output overflows uint256', async () => {
      await expect(fullMath.mulDivRoundingUp(Q128, Q128, 1)).to.be.revertedWith('')
    })

    it('accurate without phantom overflow', async () => {
      const result = Q128.div(3).add(1)
      expect(
        await fullMath.mulDivRoundingUp(
          Q128,
          /*0.5=*/ BigNumber.from(50).mul(Q128).div(100),
          /*1.5=*/ BigNumber.from(150).mul(Q128).div(100)
        )
      ).to.eq(result)
    })

    it('accurate with phantom overflow', async () => {
      const result = BigNumber.from(4375).mul(Q128).div(1000)
      expect(await fullMath.mulDivRoundingUp(Q128, BigNumber.from(35).mul(Q128), BigNumber.from(8).mul(Q128))).to.eq(
        result
      )
    })

    it('accurate with phantom overflow and repeating decimal', async () => {
      const result = BigNumber.from(1).mul(Q128).div(3).add(1)
      expect(
        await fullMath.mulDivRoundingUp(Q128, BigNumber.from(1000).mul(Q128), BigNumber.from(3000).mul(Q128))
      ).to.eq(result)
    })
  })
})